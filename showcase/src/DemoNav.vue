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

import { buildNaiveOverrides, NAV_ICON_NAMES, THEMES, UxIcon, UxTopbar } from '@ux/index'
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

/** Vier Punkte — der Richtwert des Skills liegt bei drei bis fünf. */
const punkte = NAV_ICON_NAMES.map((name) => ({ name, label: t(`demo.${name}`) }))
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
        <a
          v-for="(punkt, index) in punkte"
          :key="punkt.name"
          class="item"
          :class="{ 'item--active': index === 0 }"
          href="#"
          @click.prevent
        >
          <UxIcon :name="punkt.name" />
          <!-- Unterhalb md fällt die Beschriftung weg, nicht der Punkt. -->
          <span class="item__label">{{ punkt.label }}</span>
          <!-- Für Hilfstechnik bleibt sie: ein Symbol ohne Namen ist ein
               Knopf ohne Namen. -->
          <span class="visually-hidden">{{ punkt.label }}</span>
          <span
            v-if="index === 0"
            class="item__underline"
          />
        </a>
      </template>
    </UxTopbar>
  </NConfigProvider>
</template>

<style scoped lang="scss">
.item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  color: rgb(var(--text-bar-secondary));
  text-decoration: none;

  &--active {
    color: rgb(var(--text-bar));
  }

  &__label {
    display: none;

    @include up(md) {
      display: inline;
    }
  }

  /* Ein Strich, kein Kasten — der konkurriert nicht mit den Karten darunter. */
  &__underline {
    position: absolute;
    right: var(--space-2);
    bottom: -9px;
    left: var(--space-2);
    height: 2px;
    border-radius: var(--radius-full);
    background: rgb(var(--accent));
  }
}
</style>
