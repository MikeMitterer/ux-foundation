<script setup lang="ts">
/**
 * Fragezeichen mit Kurzerklärung — für Begriffe, die nicht selbsterklärend sind.
 *
 * Erklärung dort, wo die Frage entsteht: Wer „Investitionsreserve" liest und
 * stutzt, sucht keine Hilfeseite, sondern will es an Ort und Stelle wissen.
 * Deshalb zwei, drei Sätze am Begriff statt eines Verweises.
 *
 * Im Hinweis stehen bis zu zwei Verweise in **einer** Zeile: links die
 * Vertiefung, rechts die Stellschraube. Untereinander sah es nach einer Liste
 * aus, obwohl es zwei gleichrangige Wege sind.
 *
 * **Navigiert wird hier nicht, und übersetzt auch nicht.** Die eine App hat
 * einen Router, die andere Hash-Tabs; einen Katalog hat keine von beiden im
 * Paket. Deshalb kommen Adressen und fertige Wörter herein — und weil beides
 * echte Adressen sind, entstehen echte `a`-Elemente: Mittelklick und „in neuem
 * Tab öffnen" funktionieren damit von selbst.
 */
import { NTooltip } from 'naive-ui'

withDefaults(
  defineProps<{
    /** Bereits übersetzter Erklärungstext. */
    text: string
    /**
     * Ziel der Vertiefung — etwa eine Methodenseite samt Sprungmarke.
     * Ohne Adresse **und** Beschriftung erscheint der Verweis nicht.
     */
    moreHref?: string
    /** Beschriftung der Vertiefung, bereits übersetzt („Mehr dazu →"). */
    moreLabel?: string
    /** Ziel der Stellschraube — der Reiter, in dem der Wert steht. */
    settingHref?: string
    /** Beschriftung der Stellschraube, bereits übersetzt („Zur Einstellung →"). */
    settingLabel?: string
    /**
     * Womit der Hinweis anzeigt, dass es hier etwas zu lesen gibt.
     *
     * `question` ist die Vorgabe und der Regelfall: Ein Begriff ist
     * erklärungsbedürftig, jemand stutzt, das Fragezeichen antwortet.
     *
     * `info` passt dort, wo nichts abzugrenzen ist, sondern eine Ansicht als
     * Ganzes eingeordnet wird — ein (i) kündigt eine Auskunft an statt ein zu
     * klärendes Missverständnis. Es steht dann im Akzent, weil es etwas
     * Anklickbares markiert, und bringt seinen Kreis selbst mit.
     */
    icon?: 'question' | 'info'
  }>(),
  {
    moreHref: undefined,
    moreLabel: undefined,
    settingHref: undefined,
    settingLabel: undefined,
    icon: 'question',
  },
)
</script>

<template>
  <!--
    `keep-alive-on-hover` ist entscheidend: Ohne das verschwindet der Hinweis,
    sobald die Maus ihn erreicht — und die Verweise darin wären nicht
    anklickbar.
  -->
  <NTooltip
    trigger="hover"
    keep-alive-on-hover
    :style="{ maxWidth: '22rem' }"
  >
    <template #trigger>
      <!--
        Klein und blass: Der Hinweis darf die Zahl daneben nicht überstrahlen.
        Mit Vertiefung ein `a` — dann führt der Klick dorthin; ohne sie ein
        `button`, denn ein `a` ohne `href` ist für die Tastatur nicht
        erreichbar.
      -->
      <component
        :is="moreHref ? 'a' : 'button'"
        class="ux-hint__trigger"
        :class="`ux-hint__trigger--${icon}`"
        :href="moreHref"
        :type="moreHref ? undefined : 'button'"
        :aria-label="text"
      >
        <!--
          Das (i) als **Form**, nicht als Buchstabe — dieselbe Falle wie beim
          Pfeil (T-16): Ein Zeichen sitzt nach den Metriken seiner Schrift in
          der Zeile und nicht mittig in seinem Kasten, und keine
          Flex-Zentrierung ändert daran etwas. Kreis auf 12/12, Punkt und
          Balken auf derselben Achse — damit ist es von sich aus zentriert.
        -->
        <svg
          v-if="icon === 'info'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="M12 11.5 L12 16.5" />
          <path d="M12 7.5 L12 7.6" />
        </svg>
        <template v-else>
          ?
        </template>
      </component>
    </template>

    <div class="ux-hint__body">
      {{ text }}

      <div
        v-if="(moreHref && moreLabel) || (settingHref && settingLabel)"
        class="ux-hint__links"
      >
        <a
          v-if="moreHref && moreLabel"
          class="ux-hint__link"
          :href="moreHref"
        >{{ moreLabel }}</a>
        <a
          v-if="settingHref && settingLabel"
          class="ux-hint__link"
          :href="settingHref"
        >
          {{ settingLabel }}
        </a>
      </div>
    </div>
  </NTooltip>
</template>

<style scoped lang="scss">
@use '../styles/shared' as *;

.ux-hint__trigger {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 0.875rem;
  height: 0.875rem;
  border-radius: var(--radius-full);
  background: transparent;
  font-family: inherit;
  font-size: 0.5625rem;
  line-height: 1;
  vertical-align: middle;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;

  /*
   * Das Fragezeichen braucht einen gezeichneten Kreis um sich; das (i) bringt
   * seinen eigenen mit. Ein Rahmen um beide ergäbe dort zwei Kreise
   * ineinander.
   */
  &--question {
    border: 1px solid token(--border-default);
    @include muted(null);

    &:hover {
      border-color: token(--text-muted);
      color: token(--text-secondary);
    }
  }

  // Akzent, weil es etwas Anklickbares markiert — das ist die Rolle dieser
  // Farbe (ux-standards, „Farbe und Gewicht"). Etwas größer als das
  // Fragezeichen: Die Form trägt feinere Striche als ein Buchstabe.
  &--info {
    width: 1rem;
    height: 1rem;
    color: token(--accent);

    &:hover { opacity: 0.75; }

    svg { width: 100%; height: 100%; }
  }
}

.ux-hint__body {
  font-size: var(--font-sm);
  line-height: 1.625;
}

.ux-hint__links {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  margin-top: var(--space-1);
  font-size: var(--font-xs);
}

.ux-hint__link {
  color: token(--accent);
  text-decoration: underline dotted;

  &:hover { opacity: 0.8; }
}
</style>
