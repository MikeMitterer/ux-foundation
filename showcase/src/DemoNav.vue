<script setup lang="ts">
/**
 * Nur die Kopfzeile — für die iframes im Mobil-Abschnitt.
 *
 * Kein zweites Projekt und keine Attrappe: Dieselbe `UxTopbar` mit denselben
 * Symbolen wie überall. Ein Nachbau würde genau das nicht beweisen, worum es
 * geht.
 */
import { computed, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { NConfigProvider, darkTheme, type GlobalThemeOverrides } from 'naive-ui'

import {
  buildNaiveOverrides,
  THEMES,
  UxIcon,
  UxNavItem,
  UxTopbar,
  type NavIconName,
} from '@ux/index'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { current } = useTheme()

const isDark = computed(() => THEMES[current.value].isDark)
const naiveOverrides = ref<GlobalThemeOverrides>({})

watch(
  current,
  async () => {
    await nextTick()
    naiveOverrides.value = buildNaiveOverrides()
  },
  { immediate: true },
)

/**
 * Vier Punkte — der Richtwert des Skills liegt bei drei bis fünf.
 *
 * Bewusst eine Auswahl statt aller Symbole: Der Satz im Paket deckt inzwischen
 * die Bereiche mehrerer Apps ab, und sieben Punkte nebeneinander würden hier
 * genau die Regel verletzen, die dieser Abschnitt vorführt.
 */
const punkte: { name: NavIconName; label: string }[] = (
  ['dashboard', 'instruments', 'fx', 'settings'] as const
).map((name) => ({ name, label: t(`demo.${name}`) }))
</script>

<template>
  <NConfigProvider
    :theme="isDark ? darkTheme : null"
    :theme-overrides="naiveOverrides"
  >
    <UxTopbar
      :brand-lead="t('app.brandLead')"
      :brand-accent="t('app.brandAccent')"
    >
      <template #badge>
        <UxIcon
          name="dashboard"
          :size="16"
          :stroke-width="2.5"
        />
      </template>

      <template #nav>
        <!--
          `UxNavItem` statt nachgebauter Punkte: Beschriftung ab `md`,
          verstecktes Label für Hilfstechnik und der Unterstrich am aktiven
          Punkt stecken in der Komponente. Hier lagen dieselben Regeln vorher
          ein drittes Mal — nach StockPortfolio und StockInfo.
        -->
        <UxNavItem
          v-for="(punkt, index) in punkte"
          :key="punkt.name"
          :icon="punkt.name"
          :label="punkt.label"
          :active="index === 0"
        />
      </template>
    </UxTopbar>
  </NConfigProvider>
</template>
