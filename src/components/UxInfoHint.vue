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
  }>(),
  {
    moreHref: undefined,
    moreLabel: undefined,
    settingHref: undefined,
    settingLabel: undefined,
  },
)
</script>

<template>
  <!--
    `keep-alive-on-hover` ist entscheidend: Ohne das verschwindet der Hinweis,
    sobald die Maus ihn erreicht — und die Verweise darin wären nicht
    anklickbar.
  -->
  <NTooltip trigger="hover" keep-alive-on-hover :style="{ maxWidth: '22rem' }">
    <template #trigger>
      <!--
        Klein und blass: Der Hinweis darf die Zahl daneben nicht überstrahlen.
        Mit Vertiefung ein `a` — dann führt der Klick dorthin; ohne sie ein
        `button`, denn ein `a` ohne `href` ist für die Tastatur nicht
        erreichbar.
      -->
      <a v-if="moreHref" class="ux-hint__trigger" :href="moreHref" :aria-label="text">?</a>
      <button v-else class="ux-hint__trigger" type="button" :aria-label="text">?</button>
    </template>

    <div class="ux-hint__body">
      {{ text }}

      <div v-if="(moreHref && moreLabel) || (settingHref && settingLabel)" class="ux-hint__links">
        <a v-if="moreHref && moreLabel" class="ux-hint__link" :href="moreHref">{{ moreLabel }}</a>
        <a v-if="settingHref && settingLabel" class="ux-hint__link" :href="settingHref">
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
  border: 1px solid token(--border-default);
  border-radius: var(--radius-full);
  background: transparent;
  font-family: inherit;
  font-size: 0.5625rem;
  line-height: 1;
  vertical-align: middle;
  text-decoration: none;
  cursor: pointer;
  @include muted(null);
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: token(--text-muted);
    color: token(--text-secondary);
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
