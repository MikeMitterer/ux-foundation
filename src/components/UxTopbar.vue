<script setup lang="ts">
/**
 * Kopfzeile nach den Hauskonventionen.
 *
 * Aufbau von links nach rechts: Plakette und Wortmarke als Verweis auf die
 * Startansicht, dann die Menüpunkte, rechts nur das, was **keine** Navigation
 * ist — Aktualisieren, der Zustand der Daten, die Sitzung.
 *
 * Die Komponente stellt dar und entscheidet nichts. Alle sichtbaren Texte
 * kommen als Prop oder über einen Slot herein: Ein Paket hat keinen
 * Message-Katalog, und ein fest verdrahtetes Wort wäre in der zweiten Sprache
 * sofort falsch.
 *
 * Die Wortmarke ist **HTML-Text**, kein Bild. Ein SVG, das über `img` oder
 * `link rel=icon` hereinkommt, ist ein eigenes Dokument — es sieht weder die
 * gebündelten Schriften noch die Token und erbt keine Textfarbe. Was dort als
 * `text` steht, fällt auf eine Systemschrift zurück und trägt eine fest
 * eingetragene Füllung, die im ersten hellen Theme verschwindet.
 */
import { useSlots } from 'vue'

withDefaults(
  defineProps<{
    /** Neutraler Teil der Wortmarke — der Teil, den alle Apps teilen. */
    brandLead: string
    /** Farbiger Teil — der Teil, der die App unterscheidet. */
    brandAccent?: string
    /** Ziel des Verweises auf die Startansicht. */
    href?: string
    /** Zugänglicher Name des Verweises, falls er vom sichtbaren Text abweicht. */
    ariaLabel?: string
  }>(),
  { brandAccent: '', href: '#', ariaLabel: undefined },
)

const slots = useSlots()
</script>

<template>
  <header class="ux-topbar">
    <div class="ux-topbar__inner">
      <a
        class="ux-topbar__brand"
        :href="href"
        :aria-label="ariaLabel"
      >
        <span class="ux-topbar__badge">
          <!-- Das Zeichen liefert die App: Die Form ist gemeinsam, das Motiv nicht. -->
          <slot name="badge" />
        </span>
        <span class="ux-topbar__wordmark">{{ brandLead
        }}<span
          v-if="brandAccent"
          class="ux-topbar__brandword"
        >{{ brandAccent }}</span></span>
      </a>

      <nav
        v-if="slots.nav"
        class="ux-topbar__nav"
      >
        <slot name="nav" />
      </nav>

      <!-- Rechts steht nur, was keine Navigation ist. -->
      <div
        v-if="slots.actions"
        class="ux-topbar__actions"
      >
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.ux-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  height: var(--topbar-height);
  /* Leicht durchscheinend: Beim Scrollen schimmert der Inhalt darunter durch,
     statt hart abgeschnitten zu werden. */
  background: rgb(var(--surface-header) / 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgb(var(--border-bar));
  color: rgb(var(--text-bar));

  &__inner {
    /* Derselbe Streifen wie der Inhalt — sonst steht die Navigation über
       einem Inhalt, der anders endet als sie. */
    @include content-frame(0);
    height: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    min-width: 0;
    color: inherit;
    text-decoration: none;

    &:hover {
      opacity: 0.9;
    }
  }

  &__badge {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-sm);
    /* Fester Verlauf, nicht aus dem Theme abgeleitet — eine Marke, die je nach
       Anstrich anders aussieht, ist keine. */
    background: linear-gradient(135deg, rgb(var(--brand-from)), rgb(var(--brand-to)));
    color: rgb(var(--brand-contrast));
  }

  /* Unterhalb sm entfällt die Wortmarke, die Plakette bleibt. */
  &__wordmark {
    display: none;
    font-family: var(--font-display);
    font-size: var(--font-lg);
    font-weight: 600;
    letter-spacing: -0.015em;

    @include up(sm) {
      display: inline;
    }
  }

  &__brandword {
    color: rgb(var(--brand-word));
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    min-width: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-left: auto;
  }
}
</style>
