<script setup lang="ts">
/**
 * Alle Paletten als Kacheln — Klick wechselt den Anstrich der ganzen Seite.
 *
 * Die Kacheln kommen aus dem Paket (`UxThemePicker`). Hier standen sie vorher
 * ein drittes Mal, nach StockPortfolio und StockInfo — bei einer Komponente,
 * die genau dieses Paket vorführt, war das die peinlichste Stelle für eine
 * Kopie.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { THEME_IDS, UxThemePicker, type ThemeId } from '@ux/index'
import ShowcaseSection from '@/components/ShowcaseSection.vue'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { current, setTheme } = useTheme()

/*
 * Das Schaufenster zeigt die Kennungen selbst als Namen: Hier geht es um die
 * Paletten des Pakets, nicht um die Worte einer App.
 */
const labels = computed(
  () => Object.fromEntries(THEME_IDS.map((id) => [id, id])) as Record<ThemeId, string>,
)
</script>

<template>
  <ShowcaseSection
    anchor="themes"
    :title="t('themes.heading')"
    :hint="t('themes.hint')"
  >
    <UxThemePicker
      :current="current"
      :labels="labels"
      :active-label="t('themes.active')"
      @select="setTheme"
    />
  </ShowcaseSection>
</template>
