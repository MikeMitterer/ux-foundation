<script setup lang="ts">
/** Die beiden Familien, ihre Rollen und die Tabellenziffern. */
import { useI18n } from 'vue-i18n'

import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t } = useI18n()

/** Rollen laut Skill — Größe und Gewicht sind hier nicht verhandelbar. */
const ROLES = [
  { role: 'Wortmarke', size: '--font-lg', weight: 600, note: 'leicht negative Laufweite' },
  { role: 'Menüpunkt, Reiter', size: '--font-sm', weight: 400, note: 'keine Großbuchstaben' },
  { role: 'Kartentitel, Feldbeschriftung', size: '--font-sm', weight: 500, note: '' },
  { role: 'Abschnittsüberschrift', size: '--font-xs', weight: 500, note: 'Großbuchstaben, +0.025em' },
  { role: 'Tabellenzelle', size: '--font-sm', weight: 400, note: 'Zahlen tabular-nums' },
  { role: 'Wert einer Kennzahl', size: '--font-base', weight: 600, note: '' },
] as const
</script>

<template>
  <ShowcaseSection
    anchor="typography"
    :title="t('typography.heading')"
    :hint="t('typography.hint')"
  >
    <div class="family">
      <code class="family__token">--font-ui · Inter</code>
      <p class="family__role">
        {{ t('typography.ui') }}
      </p>
      <p class="family__sample family__sample--ui">
        {{ t('typography.sample') }}
      </p>
    </div>

    <div class="family">
      <code class="family__token">--font-display · Space Grotesk</code>
      <p class="family__role">
        {{ t('typography.display') }}
      </p>
      <p class="family__sample family__sample--display">
        {{ t('typography.sample') }}
      </p>
    </div>

    <div>
      <h3 class="label">
        {{ t('typography.roles') }}
      </h3>
      <table class="roles">
        <thead>
          <tr>
            <th>{{ t('typography.role') }}</th>
            <th>{{ t('typography.size') }}</th>
            <th>{{ t('typography.weight') }}</th>
            <th>{{ t('typography.note') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in ROLES"
            :key="entry.role"
          >
            <td>{{ entry.role }}</td>
            <td><code>{{ entry.size }}</code></td>
            <td class="roles__num">
              {{ entry.weight }}
            </td>
            <td class="roles__note">
              {{ entry.note || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h3 class="label">
        {{ t('typography.tabularSample') }}
      </h3>
      <p class="hint">
        {{ t('typography.tabularHint') }}
      </p>
      <table class="roles">
        <tbody>
          <tr
            v-for="value in [1234.5, 88.25, 100000, 7.5]"
            :key="value"
          >
            <td class="roles__num roles__num--tabular">
              {{ value.toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </ShowcaseSection>
</template>

<style scoped lang="scss">

.hint {
  @include erklaerung;
}

.family {
  padding: var(--space-4);
  border: 1px solid rgb(var(--border-subtle));
  border-radius: var(--radius-lg);
  background: rgb(var(--surface-card));

  &__token { font-size: var(--font-xs); color: rgb(var(--text-muted)); }
  &__role  { margin: var(--space-1) 0 var(--space-3); color: rgb(var(--text-secondary)); }

  &__sample {
    font-size: var(--font-xl);

    &--ui      { font-family: var(--font-ui); }
    &--display { font-family: var(--font-display); font-weight: 600; }
  }
}

.roles {
  width: 100%;
  border-collapse: collapse;

  th, td {
    text-align: left;
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid rgb(var(--border-subtle));
  }

  th { font-size: var(--font-xs); text-transform: uppercase; color: rgb(var(--text-muted)); }

  &__num { text-align: right; font-variant-numeric: tabular-nums; }
  &__num--tabular { font-size: var(--font-base); }
  &__note { color: rgb(var(--text-secondary)); }
}
</style>
