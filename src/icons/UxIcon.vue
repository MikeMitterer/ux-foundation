<script setup lang="ts">
/**
 * Rendert ein Navigationssymbol als Inline-SVG.
 *
 * Inline und nicht als Symbolschrift oder von einem CDN: Nur so lässt es sich
 * einfärben, skalieren und mit `aria-hidden` versehen — und nur so geht zur
 * Laufzeit keine Anfrage an einen fremden Server.
 *
 * Das Symbol ist dekorativ. Die Beschriftung liefert der Aufrufer, sichtbar
 * oder für Hilfstechnik — ein Symbol ohne zugänglichen Namen ist ein Knopf
 * ohne Namen.
 */
import { computed } from 'vue'

import { NAV_ICONS, type NavIconName } from './navIcons'

const props = withDefaults(
  defineProps<{
    /** Kennung des Symbols. */
    name: NavIconName
    /** Kantenlänge in Pixeln. Vorgabe entspricht der Kopfzeile. */
    size?: number
    /** Strichstärke. Vorgabe 2, wie im Zeichenstil festgelegt. */
    strokeWidth?: number
  }>(),
  { size: 15, strokeWidth: 2 },
)

const icon = computed(() => NAV_ICONS[props.name])
</script>

<template>
  <svg
    :viewBox="icon.viewBox"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template
      v-for="(path, index) in icon.paths"
      :key="index"
    >
      <circle
        v-if="path.circle"
        :cx="path.circle.cx"
        :cy="path.circle.cy"
        :r="path.circle.r"
        :fill="path.filled ? 'currentColor' : 'none'"
        :stroke="path.filled ? 'none' : 'currentColor'"
      />
      <path
        v-else
        :d="path.d"
        :fill="path.filled ? 'currentColor' : 'none'"
      />
    </template>
  </svg>
</template>
