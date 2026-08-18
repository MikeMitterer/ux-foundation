<script setup lang="ts">
/** Abstände, Radien und Schriftgrößen — die Skalen zum Anschauen. */
import { useI18n } from 'vue-i18n'

import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t } = useI18n()

const SPACES = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-6', '--space-8']
const RADII = ['--radius-sm', '--radius-lg', '--radius-full']
const FONT_SIZES = ['--font-xs', '--font-sm', '--font-base', '--font-lg', '--font-xl']

/*
 * Die Schattenstufen samt dem, wofür sie gedacht sind. Gezeigt wird nicht der
 * Wert, sondern die Wirkung: Ein Schatten ist erst dann geprüft, wenn man ihn
 * auf der Fläche sieht, über der er tatsächlich liegt — deshalb stehen die
 * Kästen auf der Seitenfläche und nicht auf einer Karte.
 */
const SHADOWS = [
  { name: '--shadow-sm', label: 'scales.shadowToast' },
  { name: '--shadow-lg', label: 'scales.shadowDialog' },
] as const
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

    <div class="scale">
      <h3 class="scale__label">
        {{ t('scales.shadows') }}
      </h3>
      <p class="scale__hint">
        {{ t('scales.shadowsHint') }}
      </p>
      <ul class="scale__row scale__row--shadows">
        <li
          v-for="stufe in SHADOWS"
          :key="stufe.name"
          class="shadow"
        >
          <span
            class="shadow__box"
            :style="{ boxShadow: `var(${stufe.name})` }"
          >{{ t(stufe.label) }}</span>
          <code class="bar__name">{{ stufe.name }}</code>
        </li>
      </ul>
    </div>
  </ShowcaseSection>
</template>

<style scoped lang="scss">
.scale {
  &__label {
    @include abschnitts-label;
  }

  &__list { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); }
  &__row  { list-style: none; display: flex; gap: var(--space-6); align-items: flex-end; }

  /*
   * Schatten brauchen Luft: Ohne Abstand schneidet der Nachbar die weiche
   * Lage an, und man vergleicht Kanten statt Schatten.
   */
  &__row--shadows {
    flex-wrap: wrap;
    gap: var(--space-8);
    padding: var(--space-4) var(--space-2) var(--space-6);
  }

  &__hint {
    max-width: 70ch;
    margin-bottom: var(--space-2);
    font-size: var(--font-sm);
    line-height: 1.6;
    color: rgb(var(--text-secondary));
  }
}

.shadow {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  align-items: center;

  /*
   * Beide Kästen sind gleich groß. Die Stufen unterscheiden sich in der Höhe,
   * in der etwas schwebt — wäre der Dialog zusätzlich größer, läge der
   * sichtbare Unterschied an der Fläche und nicht am Schatten.
   */
  &__box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14rem;
    min-height: 4.5rem;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    background: rgb(var(--surface-raised));
    font-size: var(--font-sm);
    color: rgb(var(--text-secondary));
    text-align: center;
  }
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
