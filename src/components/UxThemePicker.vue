<script setup lang="ts">
/**
 * Die Auswahl der Paletten — ein Kachelraster mit Vorschau.
 *
 * Vier Farbflächen je Kachel: Grundfläche, Karte, Text und Akzent. Daran
 * erkennt man ein Theme, bevor man es anklickt; eine Liste von Namen sagt
 * nichts über das Bild.
 *
 * Die Vorschauwerte stehen **fest** in `THEMES` und werden nicht aus den
 * CSS-Variablen gelesen: Die Token eines *nicht aktiven* Themes gibt es im
 * Dokument nicht — ohne diese Kopie ließe sich nur das gerade laufende Theme
 * zeigen. Ein Test im Paket hält sie mit `tokens.css` zusammen.
 *
 * Beschriftungen kommen als Prop herein, gespeichert wird nichts: Ein Paket
 * hat weder Katalog noch Speicherschlüssel.
 */
import { THEMES, THEME_IDS, type ThemeId } from '../theme/themes'

withDefaults(
  defineProps<{
    /** Gerade aktive Palette. */
    current: ThemeId
    /** Name je Palette — bereits übersetzt. */
    labels: Record<ThemeId, string>
    /** Kurzer Zusatz an der aktiven Kachel, etwa „aktiv". */
    activeLabel?: string
    /** Ein Satz je Palette, falls die App einen hat. */
    hints?: Partial<Record<ThemeId, string>>
  }>(),
  { activeLabel: '', hints: undefined },
)

const emit = defineEmits<{
  (event: 'select', theme: ThemeId): void
}>()
</script>

<template>
  <div class="ux-themepicker">
    <button
      v-for="id in THEME_IDS"
      :key="id"
      type="button"
      class="ux-themepicker__tile"
      :class="{ 'ux-themepicker__tile--active': id === current }"
      :aria-pressed="id === current"
      @click="emit('select', id)"
    >
      <!--
        Die Grundfläche trägt die drei übrigen Flecken — so sieht man nicht nur
        vier Farben nebeneinander, sondern wie sie zueinander stehen.
      -->
      <span
        class="ux-themepicker__preview"
        :style="{ backgroundColor: THEMES[id].preview.page }"
      >
        <span
          class="ux-themepicker__swatch ux-themepicker__swatch--card"
          :style="{ backgroundColor: THEMES[id].preview.card }"
        />
        <span
          class="ux-themepicker__swatch ux-themepicker__swatch--ink"
          :style="{ backgroundColor: THEMES[id].preview.ink }"
        />
        <span
          class="ux-themepicker__swatch ux-themepicker__swatch--accent"
          :style="{ backgroundColor: THEMES[id].preview.accent }"
        />
      </span>

      <span class="ux-themepicker__name">
        <span class="ux-themepicker__label">{{ labels[id] }}</span>
        <span
          v-if="id === current && activeLabel"
          class="ux-themepicker__active"
        >{{ activeLabel }}</span>
      </span>

      <span
        v-if="hints?.[id]"
        class="ux-themepicker__hint"
      >{{ hints[id] }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/shared' as *;

.ux-themepicker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: var(--space-3);
}

.ux-themepicker__tile {
  @include stack(var(--space-2));
  padding: var(--space-2);
  border: 1px solid token(--border-default);
  border-radius: var(--radius-lg);
  background-color: token(--surface-card);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover { border-color: token(--accent); }

  /*
   * Rahmen **und** Ring: Die Kacheln sind selbst bunt, und ein einzelner
   * eingefärbter Rahmen geht auf einer Palette unter, die zufällig ähnlich
   * liegt.
   */
  &--active {
    border-color: token(--accent);
    box-shadow: 0 0 0 2px token(--accent, 0.4);
  }
}

.ux-themepicker__preview {
  position: relative;
  display: block;
  height: 3rem;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.ux-themepicker__swatch {
  position: absolute;
  border-radius: var(--radius-sm);

  &--card {
    inset: 0.5rem 0.5rem 0.5rem 0.5rem;
  }

  &--ink {
    top: 0.9rem;
    left: 0.9rem;
    width: 40%;
    height: 0.35rem;
    border-radius: var(--radius-full);
  }

  &--accent {
    right: 0.75rem;
    bottom: 0.75rem;
    width: 0.85rem;
    height: 0.85rem;
    border-radius: var(--radius-full);
  }
}

.ux-themepicker__name {
  @include row(var(--space-2));
  justify-content: space-between;
  font-size: var(--font-sm);
  color: token(--text-primary);
}

.ux-themepicker__label {
  font-weight: 500;
}

.ux-themepicker__active {
  font-size: var(--font-xs);
  color: token(--accent);
}

.ux-themepicker__hint {
  @include muted;
  line-height: 1.4;
}
</style>
