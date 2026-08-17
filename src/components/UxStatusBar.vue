<script setup lang="ts">
/**
 * Schmale Zeile am unteren Rand — der Zustand der App auf einen Blick.
 *
 * Reine Darstellung. Sämtliche Texte kommen als Prop — was „vor 4 Std" heißt,
 * weiß nur der Katalog der App, und ein Paket hat keinen.
 */
import { computed } from 'vue'

/** Zustand der Gegenstelle. Farbe allein trägt die Aussage nicht. */
export type BackendState = 'unknown' | 'checking' | 'online' | 'offline'

const props = withDefaults(
  defineProps<{
    /** Name der App. */
    appName: string
    /** Optionaler Zusatz vor der Herkunft, bereits übersetzt. */
    poweredByLabel?: string
    /** Herkunft, in der Akzentfarbe verlinkt. */
    originName?: string
    originHref?: string
    /** Der aktive Kontext samt Größe („Beispiel-Depot, 6 Positionen"). */
    context?: string
    /** Alter der Daten, fertig formuliert („Kurse vor 4 Std"). */
    dataAge?: string
    /** Fehlgeschlagenes — nur setzen, wenn es welches gibt. */
    failures?: string
    /** Technischer Stand der App. */
    version?: string
    /** Adresse der Gegenstelle, ohne Schema. */
    backendHost?: string
    backendState?: BackendState
    backendVersion?: string
    /** Zustand ausgeschrieben — Farbe darf nie der einzige Träger sein. */
    backendStateLabel?: string
  }>(),
  {
    poweredByLabel: '',
    originName: '',
    originHref: '',
    context: '',
    dataAge: '',
    failures: '',
    version: '',
    backendHost: '',
    backendState: 'unknown',
    backendVersion: '',
    backendStateLabel: '',
  },
)

const emit = defineEmits<{
  /** Klick auf den Zustandsbereich — führt üblicherweise auf die Statusseite. */
  (event: 'backend-click'): void
}>()

/** Trennpunkte nur zwischen tatsächlich vorhandenen Angaben. */
const hasContext = computed(() => props.context.length > 0)
const hasDataAge = computed(() => props.dataAge.length > 0)
/**
 * Der Zustandsbereich erscheint, sobald es etwas über die Gegenstelle zu sagen
 * gibt.
 *
 * Nicht an der Adresse festgemacht: Eine App, die über einen Proxy spricht,
 * zeigt keine — verlöre damit aber den farbigen Punkt, und der ist das
 * Wichtigste daran. Umgekehrt schweigt der Bereich, solange nichts bekannt
 * ist: Ein grauer Punkt ohne Aussage ist schlechter als keiner.
 */
const hasBackend = computed(
  () =>
    props.backendHost.length > 0 ||
    props.backendState !== 'unknown' ||
    props.backendStateLabel.length > 0,
)
</script>

<template>
  <footer class="ux-statusbar">
    <div class="ux-statusbar__inner">
      <span class="ux-statusbar__left">
        <span class="ux-statusbar__brand">
          <span class="ux-statusbar__app">{{ appName }}</span>
          <template v-if="originName">
            {{ poweredByLabel }}
            <a
              v-if="originHref"
              class="ux-statusbar__origin"
              :href="originHref"
              target="_blank"
              rel="noopener noreferrer"
            >{{ originName }}</a>
            <span
              v-else
              class="ux-statusbar__origin"
            >{{ originName }}</span>
          </template>
        </span>

        <!--
          Verschwindet ein Element, muss auch sein Trennzeichen verschwinden.
          Sonst steht ein verwaister Mittelpunkt am Zeilenanfang.
        -->
        <span
          v-if="hasContext"
          class="ux-statusbar__sep"
        >·</span>
        <span
          v-if="hasContext"
          class="ux-statusbar__strong"
        >{{ context }}</span>

        <span
          v-if="hasDataAge"
          class="ux-statusbar__sep"
        >·</span>
        <span v-if="hasDataAge">{{ dataAge }}</span>

        <span
          v-if="failures"
          class="ux-statusbar__failures"
        >{{ failures }}</span>

        <slot name="left" />
      </span>

      <span class="ux-statusbar__tech">
        <slot name="right" />

        <span
          v-if="version"
          class="ux-statusbar__version"
        >{{ version }}</span>

        <button
          v-if="hasBackend"
          class="ux-statusbar__backend"
          :title="backendStateLabel || undefined"
          @click="emit('backend-click')"
        >
          <span
            class="ux-statusbar__dot"
            :class="`ux-statusbar__dot--${backendState}`"
          />
          <span
            v-if="backendHost"
            class="ux-statusbar__host"
            :class="{ 'ux-statusbar__host--offline': backendState === 'offline' }"
          >{{ backendHost }}</span>
          <!--
            Ohne Adresse trägt die Beschriftung den Zustand: Farbe darf nie der
            einzige Träger einer Information sein.
          -->
          <span
            v-else-if="backendStateLabel"
            class="ux-statusbar__host"
            :class="{ 'ux-statusbar__host--offline': backendState === 'offline' }"
          >{{ backendStateLabel }}</span>
          <span
            v-if="backendVersion"
            class="ux-statusbar__backend-version"
          >{{
            backendVersion
          }}</span>
        </button>
      </span>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.ux-statusbar {
  position: sticky;
  bottom: 0;
  z-index: 9;
  /* Deckkraft als Token — siehe `tokens.css`: Der Prüfer muss gegen die
     gemischte Fläche rechnen, nicht gegen `--surface-statusbar`. */
  background: rgb(var(--surface-statusbar) / var(--surface-statusbar-alpha));
  backdrop-filter: blur(8px);
  border-top: 1px solid rgb(var(--border-bar));
  color: rgb(var(--text-bar-muted));
  font-size: 11px;

  &__inner {
    /* Derselbe Streifen wie Kopfzeile und Inhalt — nachprüfbar dadurch, dass
       linke und rechte Kante bei jeder Breite übereinstimmen. */
    @include content-frame(var(--space-2));
    display: flex;
    align-items: center;
    gap: var(--space-2);
    /* Darf umbrechen — auf schmalen Schirmen zweizeilig statt abgeschnitten. */
    flex-wrap: wrap;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
    min-width: 0;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    /* Zierrat — geht zuerst. */
    @include below(sm) {
      display: none;
    }
  }

  &__app {
    color: rgb(var(--text-bar-secondary));
  }

  &__origin {
    /*
     * Der Akzent **der Leiste**, nicht der des Inhalts: Ein Blau, auf dem
     * weiße Schrift trägt, ist als Schrift auf einer dunklen Leiste zu
     * dunkel. Wo ein Theme nichts anderes sagt, fällt das Token auf
     * `--accent` zurück — für die meisten ändert sich damit nichts.
     */
    color: rgb(var(--text-bar-accent));
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__strong {
    color: rgb(var(--text-bar-secondary));
  }

  /* Trennpunkte entfallen unterhalb sm — dort ist der Platz zu knapp. */
  &__sep {
    @include below(sm) {
      display: none;
    }
  }

  &__failures {
    color: rgb(var(--status-out));
  }

  &__tech {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-left: auto;
  }

  /* Zusatzangabe — steht auch auf der Statusseite. */
  &__version {
    font-variant-numeric: tabular-nums;

    @include below(sm) {
      display: none;
    }
  }

  &__backend {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;

    &:hover {
      color: rgb(var(--text-bar-secondary));
    }

    /*
     * Unterhalb sm bleibt vom Knopf nur der Punkt übrig — sieben mal sieben
     * Pixel, das trifft niemand. Verlangt sind 44 × 44.
     *
     * Die Fläche wächst deshalb über ein Pseudo-Element und nicht über
     * `min-height`: Letzteres drückt die Zeilenhöhe auf und machte aus einer
     * schmalen Leiste eine 61 Pixel hohe. So bleibt sie bei 34 und ist
     * trotzdem zu treffen.
     */
    @include below(sm) {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 0;
        width: 44px;
        height: 44px;
        transform: translateY(-50%);
      }
    }
  }

  /* Fremdversion und Adresse sind Zusatzangaben; der Punkt bleibt. */
  &__backend-version {
    font-variant-numeric: tabular-nums;

    @include below(sm) {
      display: none;
    }
  }

  &__host {
    @include below(sm) {
      display: none;
    }
  }

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: var(--radius-full);
    flex: none;

    &--online {
      background: rgb(var(--status-ok));
    }
    &--checking {
      background: rgb(var(--status-near));
    }
    &--offline {
      background: rgb(var(--status-out));
    }
    &--unknown {
      background: rgb(var(--text-bar-muted));
    }
  }

  &__host--offline {
    color: rgb(var(--status-out));
  }
}
</style>
