<script setup lang="ts">
/** Die wiederkehrenden Navigationssymbole, in drei Größen. */
import { useI18n } from 'vue-i18n'

import { NAV_ICON_NAMES, UxIcon } from '@ux/index'
import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t } = useI18n()

const SIZES = [15, 24, 40] as const
</script>

<template>
  <ShowcaseSection
    anchor="icons"
    :title="t('icons.heading')"
    :hint="t('icons.hint')"
  >
    <ul class="icons">
      <li
        v-for="name in NAV_ICON_NAMES"
        :key="name"
        class="icon"
      >
        <span class="icon__row">
          <UxIcon
            v-for="size in SIZES"
            :key="size"
            :name="name"
            :size="size"
          />
        </span>
        <code class="icon__name">{{ name }}</code>
      </li>
    </ul>
    <p class="note">
      {{ t('icons.settingsNote') }}
    </p>
  </ShowcaseSection>
</template>

<style scoped lang="scss">
.icons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-3);
  list-style: none;
}

.icon {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid rgb(var(--border-subtle));
  border-radius: var(--radius-lg);
  background: rgb(var(--surface-card));

  &__row { display: flex; align-items: center; gap: var(--space-3); color: rgb(var(--text-primary)); }
  &__name { font-size: var(--font-xs); color: rgb(var(--text-muted)); }
}

.note {
  max-width: 70ch;
  color: rgb(var(--text-secondary));
  line-height: 1.6;
}
</style>
