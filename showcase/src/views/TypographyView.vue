<script setup lang="ts">
/** Die beiden Familien, ihre Rollen und die Tabellenziffern. */
import { useI18n } from 'vue-i18n'

import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t, n } = useI18n()

/**
 * Rollen laut Skill — Größe und Gewicht sind hier nicht verhandelbar.
 *
 * `role` und `note` sind **Katalog-Schlüssel**, keine Texte: Die Tabelle war
 * sonst halb übersetzt — Kopfzeile aus dem Katalog, Inhalt fest verdrahtet
 * deutsch. Größe und Gewicht bleiben Werte; die übersetzt niemand.
 *
 * `note: null` heißt „keine Anmerkung" und zeigt einen Gedankenstrich. Ein
 * leerer Katalog-Eintrag wäre die schlechtere Lösung: Er sieht aus wie ein
 * vergessener und der Test der Kataloge schlägt darauf an.
 */
const ROLES = [
  { role: 'roleWordmark', size: '--font-lg', weight: 600, note: 'noteWordmark' },
  { role: 'roleNavItem', size: '--font-sm', weight: 400, note: 'noteNavItem' },
  { role: 'roleCardTitle', size: '--font-sm', weight: 500, note: null },
  { role: 'roleSectionLabel', size: '--font-xs', weight: 500, note: 'noteSectionLabel' },
  { role: 'roleTableCell', size: '--font-sm', weight: 400, note: 'noteTableCell' },
  { role: 'roleKpiValue', size: '--font-base', weight: 600, note: null },
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
            <td>{{ t(`typography.${entry.role}`) }}</td>
            <td><code>{{ entry.size }}</code></td>
            <td class="roles__num">
              {{ entry.weight }}
            </td>
            <td class="roles__note">
              {{ entry.note ? t(`typography.${entry.note}`) : '—' }}
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
            <!--
              `n()` und nicht `toFixed(2)`: Das Zahlenformat schaltet mit der
              Sprache mit — 1.234,50 gegen 1,234.50. Eine Beschriftung zu
              übersetzen und die Zahl darunter im Format der anderen Sprache
              stehen zu lassen ist der übliche Fehler, und ausgerechnet in der
              Ansicht, die Ziffern vorführt, wäre er am sichtbarsten.
            -->
            <td class="roles__num roles__num--tabular">
              {{ n(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
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
