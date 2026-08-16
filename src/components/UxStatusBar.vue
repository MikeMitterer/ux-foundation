<script setup lang="ts">
/**
 * Schmale Zeile am unteren Rand — der Zustand der App auf einen Blick.
 *
 * Antwort auf eine wiederkehrende Frage: Sind die Zahlen, die ich gerade
 * ansehe, überhaupt aktuell? Steht die Gegenstelle? Welcher Stand läuft hier?
 * Das gehört an einen festen Platz, nicht verteilt über Kopfzeile,
 * Einstellungen und Konsole.
 *
 * Bewusst leise: Sie steht dauerhaft im Bild und darf mit den eigentlichen
 * Daten nicht um Aufmerksamkeit ringen.
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
    /** „powered by" — der Zusatz davor, als Text der App. */
    poweredByLabel?: string
    /** Herkunft, in der Akzentfarbe verlinkt. */
    originName?: string
    originHref?: string
    /**
     * Der aktive Kontext samt Größe („Beispiel-Depot, 6 Positionen").
     * Sobald es mehr als einen gibt, ist das Pflicht: Ohne ihn ist jede Zahl
     * auf dem Bildschirm mehrdeutig.
     */
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
    poweredByLabel: 'powered by',
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
const hasBackend = computed(() => props.backendHost.length > 0)
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

        <!--
          Anklickbar statt bloß informativ: Wer hier ein rotes Licht sieht, will
          als Nächstes wissen, woran es liegt.
        -->
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
            class="ux-statusbar__host"
            :class="{ 'ux-statusbar__host--offline': backendState === 'offline' }"
          >{{ backendHost }}</span>
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
  background: rgb(var(--surface-statusbar) / 0.9);
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

  /*
   * Was zuerst weicht, ist nicht beliebig — der Skill gibt die Reihenfolge vor:
   * erst Zierrat (Herkunftszeile, Trennpunkte), dann Zusatzangaben (Adressen,
   * Fremdversionen). Nie weichen: der aktive Kontext, der Zustand und die
   * Handlung.
   *
   * Gemessen bei 375 px ohne diese Regeln: drei Zeilen, 83 px hoch. Erlaubt
   * sind zwei.
   */
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
    color: rgb(var(--accent));
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
