<script setup lang="ts">
/**
 * Die Komponenten des Pakets selbst — getrennt von den Fremdkomponenten.
 *
 * Zwei davon stehen gerade ohnehin auf dem Bildschirm: die Kopfzeile oben und
 * die Statuszeile unten. Sie hier ein zweites Mal einzubauen wäre eine
 * Attrappe; stattdessen steht daneben, worauf man achten soll.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { UxInlineNumber, UxNavItem, type NavIconName } from '@ux/index'
import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t, n } = useI18n()

/** Ein Menüpunkt, der sich anklicken lässt — sonst sieht man den Wechsel nicht. */
const navPunkte: { name: NavIconName; key: string }[] = [
  { name: 'dashboard', key: 'dashboard' },
  { name: 'instruments', key: 'instruments' },
  { name: 'fx', key: 'fx' },
  { name: 'settings', key: 'settings' },
]
const aktiverPunkt = ref<NavIconName>('dashboard')

interface Position {
  symbol: string
  name: string
  units: number
  target: number
}

const positions = ref<Position[]>([
  { symbol: 'VGWL.DE', name: 'Vanguard FTSE All-World', units: 500, target: 45 },
  { symbol: 'EQQQ.DE', name: 'Invesco Nasdaq-100', units: 50, target: 15 },
  { symbol: '4GLD.DE', name: 'Xetra-Gold', units: 100, target: 10 },
])

/** Summe der Ziele — über 100 % ist ungültig und färbt die Zellen. */
const targetSum = ref(70)

function recalcSum(): void {
  targetSum.value = positions.value.reduce((sum, entry) => sum + entry.target, 0)
}

function setUnits(position: Position, value: number): void {
  position.units = value
}

function setTarget(position: Position, value: number): void {
  position.target = value
  recalcSum()
}
</script>

<template>
  <ShowcaseSection
    anchor="own"
    :title="t('own.heading')"
    :hint="t('own.hint')"
  >
    <div>
      <h3 class="label">
        {{ t('own.inlineHeading') }}
      </h3>
      <p class="hint">
        {{ t('own.inlineHint') }}
      </p>

      <table class="grid">
        <thead>
          <tr>
            <th>{{ t('table.symbol') }}</th>
            <th>{{ t('table.name') }}</th>
            <th class="grid__num">
              {{ t('own.units') }}
            </th>
            <th class="grid__num">
              {{ t('own.target') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="position in positions"
            :key="position.symbol"
          >
            <td>{{ position.symbol }}</td>
            <td class="grid__muted">
              {{ position.name }}
            </td>
            <td class="grid__num">
              <UxInlineNumber
                :value="position.units"
                :display="n(position.units)"
                :precision="0"
                :min="0"
                :edit-label="t('own.edit')"
                :clear-label="t('own.clear')"
                @commit="setUnits(position, $event)"
              />
            </td>
            <td class="grid__num">
              <!--
                `empty-value` gesetzt: Beim Ziel bedeutet ein leeres Feld
                tatsächlich null. Beim Bestand darüber nicht — wer dort das Feld
                leert und wegklickt, will seine 500 Stück nicht verlieren.
              -->
              <UxInlineNumber
                :value="position.target"
                :display="`${n(position.target)} %`"
                :precision="1"
                :min="0"
                :max="100"
                :empty-value="0"
                :invalid="targetSum > 100"
                :edit-label="t('own.edit')"
                :clear-label="t('own.clear')"
                @commit="setTarget(position, $event)"
              />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">
              {{ t('own.targetSum') }}
            </td>
            <td
              class="grid__num"
              :class="{ 'grid__num--invalid': targetSum > 100 }"
            >
              {{ n(targetSum) }} %
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div>
      <h3 class="label">
        {{ t('own.navHeading') }}
      </h3>
      <p class="hint">
        {{ t('own.navHint') }}
      </p>

      <!--
        Auf der Leisten-Fläche statt auf der Seite: Der Punkt holt seine
        Textfarben aus den Leisten-Token, und auf hellem Grund sähe man den
        Kontrast falsch.
      -->
      <div class="navdemo">
        <UxNavItem
          v-for="punkt in navPunkte"
          :key="punkt.key"
          :icon="punkt.name"
          :label="t(`demo.${punkt.key}`)"
          :active="punkt.name === aktiverPunkt"
          @select="aktiverPunkt = punkt.name"
        />
      </div>
      <p class="hint">
        {{ t('own.navResize') }}
      </p>
    </div>

    <div>
      <h3 class="label">
        {{ t('own.barsHeading') }}
      </h3>
      <ul class="notes">
        <li>{{ t('own.topbarNote') }}</li>
        <li>{{ t('own.statusbarNote') }}</li>
      </ul>
    </div>
  </ShowcaseSection>
</template>

<style scoped lang="scss">
.label {
  @include abschnitts-label;
}

.hint {
  @include erklaerung;
}

.grid {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid rgb(var(--border-subtle));
  }

  th {
    font-size: var(--font-xs);
    text-transform: uppercase;
    color: rgb(var(--text-muted));
  }

  &__num {
    text-align: right;
    font-variant-numeric: tabular-nums;

    &--invalid {
      color: rgb(var(--status-out));
    }
  }

  &__muted {
    color: rgb(var(--text-secondary));
  }

  tfoot td {
    border-bottom: none;
    color: rgb(var(--text-secondary));
  }
}

.notes {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-left: var(--space-4);
  max-width: 80ch;
  color: rgb(var(--text-secondary));
  line-height: 1.6;
  list-style: disc;
}

/* Leisten-Fläche, damit die Textfarben des Punkts dort stehen, wo sie hingehören. */
.navdemo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid rgb(var(--border-bar));
  border-radius: var(--radius-lg);
  background: rgb(var(--surface-header));
}
</style>
