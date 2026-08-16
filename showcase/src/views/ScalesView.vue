<script setup lang="ts">
/** Abstände, Radien und Schriftgrößen — die Skalen zum Anschauen. */
import { useI18n } from 'vue-i18n'

import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t } = useI18n()

const SPACES = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-6', '--space-8']
const RADII = ['--radius-sm', '--radius-lg', '--radius-full']
const FONT_SIZES = ['--font-xs', '--font-sm', '--font-base', '--font-lg', '--font-xl']
</script>

<template>
  <ShowcaseSection
    anchor="scales"
    :title="t('scales.heading')"
    :hint="t('scales.hint')"
  >
    <div class="scale">
      <h3 class="scale__label">
        {{ t('scales.space') }}
      </h3>
      <ul class="scale__list">
        <li
          v-for="name in SPACES"
          :key="name"
          class="bar"
        >
          <code class="bar__name">{{ name }}</code>
          <span
            class="bar__fill"
            :style="{ width: `var(${name})` }"
          />
        </li>
      </ul>
    </div>

    <div class="scale">
      <h3 class="scale__label">
        {{ t('scales.radius') }}
      </h3>
      <ul class="scale__row">
        <li
          v-for="name in RADII"
          :key="name"
          class="radius"
        >
          <span
            class="radius__box"
            :style="{ borderRadius: `var(${name})` }"
          />
          <code class="bar__name">{{ name }}</code>
        </li>
      </ul>
    </div>

    <div class="scale">
      <h3 class="scale__label">
        {{ t('scales.fontSizes') }}
      </h3>
      <ul class="scale__list">
        <li
          v-for="name in FONT_SIZES"
          :key="name"
          class="type"
        >
          <code class="bar__name">{{ name }}</code>
          <span :style="{ fontSize: `var(${name})` }">{{ t('typography.sample') }}</span>
        </li>
      </ul>
    </div>
  </ShowcaseSection>
</template>

<style scoped lang="scss">
.scale {
  &__label {
    font-size: var(--font-xs);
    font-weight: 500;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: rgb(var(--text-muted));
    margin-bottom: var(--space-3);
  }

  &__list { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); }
  &__row  { list-style: none; display: flex; gap: var(--space-6); align-items: flex-end; }
}

.bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);

  &__name {
    font-size: var(--font-xs);
    color: rgb(var(--text-secondary));
    min-width: 7rem;
  }

  &__fill {
    height: 1rem;
    background: rgb(var(--accent));
    border-radius: 2px;
  }
}

.radius {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: center;

  &__box {
    width: 4rem;
    height: 4rem;
    background: rgb(var(--surface-raised));
    border: 1px solid rgb(var(--border-default));
  }
}

.type { display: flex; align-items: baseline; gap: var(--space-3); }
</style>
