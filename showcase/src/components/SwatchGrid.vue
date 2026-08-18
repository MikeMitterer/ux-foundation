<script setup lang="ts">
/**
 * Zeigt eine Gruppe von Farb-Token als Kacheln — Name, Fläche, gemessener Wert.
 *
 * Die Werte werden zur Laufzeit aus den gesetzten CSS-Variablen gelesen und
 * nicht mitgegeben: Sonst müsste diese Datei bei jedem Theme-Wechsel und bei
 * jeder Wertänderung nachgezogen werden, und genau das soll das Paket
 * verhindern.
 */
import { computed } from 'vue'

const props = defineProps<{
  label: string
  tokens: string[]
  /** Fläche, gegen die der Kontrast gemessen wird. Ohne sie kein Messwert. */
  contrastAgainst?: string
  /** Token als Textfarbe zeigen statt als Fläche. */
  asText?: boolean
  /** Nonce, die ein Neuberechnen nach dem Theme-Wechsel auslöst. */
  revision: string
}>()

/** Relative Leuchtdichte nach WCAG. */
function luminance(rgb: [number, number, number]): number {
  const channel = (value: number): number => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
}

/** Liest ein Token als RGB-Tripel; `null` wenn es nicht gesetzt ist. */
function readToken(name: string): [number, number, number] | null {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const parts = raw.split(/[\s,]+/).filter(Boolean).map(Number)
  return parts.length >= 3 && parts.every((n) => !Number.isNaN(n))
    ? [parts[0], parts[1], parts[2]]
    : null
}

interface Swatch {
  name: string
  rgb: [number, number, number] | null
  hex: string
  contrast: string | null
}

const swatches = computed<Swatch[]>(() => {
  void props.revision

  const background = props.contrastAgainst ? readToken(props.contrastAgainst) : null

  return props.tokens.map((name) => {
    const rgb = readToken(name)
    const hex = rgb ? `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}` : '—'

    let contrast: string | null = null
    if (rgb && background) {
      const [high, low] = [luminance(rgb), luminance(background)].sort((a, b) => b - a)
      contrast = `${((high + 0.05) / (low + 0.05)).toFixed(2)}:1`
    }

    return { name, rgb, hex, contrast }
  })
})
</script>

<template>
  <div class="swatches">
    <h3 class="swatches__label">
      {{ label }}
    </h3>
    <ul class="swatches__grid">
      <li
        v-for="swatch in swatches"
        :key="swatch.name"
        class="swatch"
      >
        <span
          class="swatch__chip"
          :class="{ 'swatch__chip--text': asText }"
          :style="
            asText
              ? { color: `rgb(var(${swatch.name}))` }
              : { background: `rgb(var(${swatch.name}))` }
          "
        >{{ asText ? 'Ag' : '' }}</span>
        <code class="swatch__name">{{ swatch.name }}</code>
        <span class="swatch__value">{{ swatch.hex }}</span>
        <span
          v-if="swatch.contrast"
          class="swatch__contrast"
        >{{ swatch.contrast }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.swatches {
  &__label {
    @include abschnitts-label;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-3);
    list-style: none;
  }
}

.swatch {
  display: grid;
  grid-template-columns: 2.5rem 1fr auto;
  grid-template-areas: 'chip name value' 'chip contrast contrast';
  align-items: center;
  gap: 0 var(--space-3);
  padding: var(--space-2);
  border: 1px solid rgb(var(--border-subtle));
  border-radius: var(--radius-sm);
  background: rgb(var(--surface-card));

  &__chip {
    grid-area: chip;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-sm);
    border: 1px solid rgb(var(--border-default));

    &--text {
      display: grid;
      place-items: center;
      background: rgb(var(--surface-card));
      font-family: var(--font-display);
      font-size: var(--font-base);
      font-weight: 600;
    }
  }

  &__name {
    grid-area: name;
    font-size: var(--font-xs);
    word-break: break-all;
  }

  &__value {
    grid-area: value;
    font-size: var(--font-xs);
    color: rgb(var(--text-muted));
    font-variant-numeric: tabular-nums;
  }

  &__contrast {
    grid-area: contrast;
    font-size: var(--font-xs);
    color: rgb(var(--text-secondary));
    font-variant-numeric: tabular-nums;
  }
}
</style>
