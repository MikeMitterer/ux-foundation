<script setup lang="ts">
/** Alle Farb-Token gruppiert, mit gemessenem Wert und Kontrast. */
import { useI18n } from 'vue-i18n'

import ShowcaseSection from '@/components/ShowcaseSection.vue'
import SwatchGrid from '@/components/SwatchGrid.vue'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { current } = useTheme()

const SURFACES = ['--surface-page', '--surface-card', '--surface-raised', '--surface-sunken']
const BARS = ['--surface-header', '--surface-statusbar', '--border-bar']
const TEXT = ['--text-primary', '--text-secondary', '--text-muted']
const BORDERS = ['--border-default', '--border-subtle']
const ACCENT = ['--accent', '--accent-contrast']
const STATUS = ['--status-ok', '--status-near', '--status-out']
const ASSETS = [
  '--asset-stocks',
  '--asset-bonds',
  '--asset-metals',
  '--asset-moneymarket',
  '--asset-cash',
]
const BRAND = ['--brand-from', '--brand-to', '--brand-contrast', '--brand-word']
</script>

<template>
  <ShowcaseSection
    anchor="tokens"
    :title="t('tokens.heading')"
    :hint="t('tokens.hint')"
  >
    <SwatchGrid
      :label="t('tokens.surfaces')"
      :tokens="SURFACES"
      :revision="current"
    />
    <SwatchGrid
      :label="t('tokens.bars')"
      :tokens="BARS"
      :revision="current"
    />
    <SwatchGrid
      :label="`${t('tokens.text')} — ${t('tokens.contrastAgainstCard')}`"
      :tokens="TEXT"
      contrast-against="--surface-card"
      as-text
      :revision="current"
    />
    <SwatchGrid
      :label="t('tokens.borders')"
      :tokens="BORDERS"
      :revision="current"
    />
    <SwatchGrid
      :label="t('tokens.accent')"
      :tokens="ACCENT"
      :revision="current"
    />
    <SwatchGrid
      :label="t('tokens.status')"
      :tokens="STATUS"
      :revision="current"
    />
    <SwatchGrid
      :label="t('tokens.assets')"
      :tokens="ASSETS"
      :revision="current"
    />
    <SwatchGrid
      :label="`${t('tokens.brand')} — ${t('tokens.themeIndependent')}`"
      :tokens="BRAND"
      :revision="current"
    />
  </ShowcaseSection>
</template>
