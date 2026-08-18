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

import { UxCaret, UxInfoHint, UxInlineNumber, UxNavItem, type NavIconName } from '@ux/index'
import SectionIndex, { type IndexItem } from '@/components/SectionIndex.vue'
import ShowcaseBlock from '@/components/ShowcaseBlock.vue'
import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t, n } = useI18n()

/**
 * Was dieser Abschnitt zeigt — **eine** Quelle für die Sprungleiste oben und
 * die Blöcke darunter. Zwei Listen liefen auseinander, sobald ein Baustein
 * dazukommt.
 */
const BLOECKE = [
  { anchor: 'own-inline', label: 'UxInlineNumber' },
  { anchor: 'own-nav', label: 'UxNavItem' },
  { anchor: 'own-hint', label: 'UxInfoHint' },
  { anchor: 'own-caret', label: 'UxCaret' },
  { anchor: 'own-bars', label: 'UxTopbar · UxStatusBar' },
] as const satisfies readonly IndexItem[]

/** Ein Menüpunkt, der sich anklicken lässt — sonst sieht man den Wechsel nicht. */
const navPunkte: { name: NavIconName; key: string }[] = [
  { name: 'dashboard', key: 'dashboard' },
  { name: 'instruments', key: 'instruments' },
  { name: 'fx', key: 'fx' },
  { name: 'settings', key: 'settings' },
]
const aktiverPunkt = ref<NavIconName>('dashboard')

/**
 * Ein umschaltbarer Zustand für den Pfeil — ein Standbild zeigt nicht, worum
 * es geht: dass die Form beim Drehen mittig bleibt, sieht man erst im Wechsel.
 */
const aufgeklappt = ref(true)

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

/*
 * `null` kann hier nicht auftreten — beide Spalten geben einen zahligen
 * Leerwert vor. Die Signatur nimmt es trotzdem entgegen, weil das Ereignis es
 * seit dem Zustand „nicht gesetzt" mitbringt; still auf `0` zu fallen wäre
 * genau der Datenverlust, den die Komponente vermeiden soll.
 */
function setUnits(position: Position, value: number | null): void {
  if (value !== null) position.units = value
}

function setTarget(position: Position, value: number | null): void {
  if (value === null) return
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
    <SectionIndex
      :items="BLOECKE"
      :label="t('index.label')"
    />

    <ShowcaseBlock
      :id="BLOECKE[0].anchor"
      :title="t('own.inlineHeading')"
      :hint="t('own.inlineHint')"
    >
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
    </ShowcaseBlock>

    <ShowcaseBlock
      :id="BLOECKE[1].anchor"
      :title="t('own.navHeading')"
      :hint="t('own.navHint')"
    >
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
    </ShowcaseBlock>

    <ShowcaseBlock
      :id="BLOECKE[2].anchor"
      :title="t('own.hintHeading')"
      :hint="t('own.hintHint')"
    >
      <!--
        Am Begriff, nicht in einer Hilfeseite: Der Hinweis steht dort, wo die
        Frage entsteht. Zum Überfahren mit der Maus.
      -->
      <p class="hintdemo">
        {{ t('own.hintTerm') }}
        <UxInfoHint
          :text="t('own.hintText')"
          more-href="#/patterns"
          :more-label="t('own.hintMore')"
          setting-href="#/scales"
          :setting-label="t('own.hintSetting')"
        />
      </p>
    </ShowcaseBlock>

    <ShowcaseBlock
      :id="BLOECKE[3].anchor"
      :title="t('own.caretHeading')"
      :hint="t('own.caretHint')"
    >
      <!--
        Beide Bewegungen nebeneinander und im selben Zustand: Nur so sieht man,
        dass sie **verschiedenes** aussagen und nicht bloß verschieden aussehen.
      -->
      <div class="caretdemo">
        <button
          type="button"
          class="caretdemo__toggle"
          @click="aufgeklappt = !aufgeklappt"
        >
          {{ t('own.caretToggle') }}
        </button>

        <p class="caretdemo__row">
          <UxCaret :open="aufgeklappt" />
          <span>{{ t('own.caretFlip') }}</span>
        </p>
        <p class="caretdemo__row">
          <UxCaret
            :open="aufgeklappt"
            motion="turn"
          />
          <span>{{ t('own.caretTurn') }}</span>
        </p>
        <p class="caretdemo__row">
          <UxCaret
            :open="aufgeklappt"
            size="sm"
          />
          <UxCaret
            :open="aufgeklappt"
            size="md"
          />
          <span>{{ t('own.caretSizes') }}</span>
        </p>
      </div>
    </ShowcaseBlock>

    <ShowcaseBlock
      :id="BLOECKE[4].anchor"
      :title="t('own.barsHeading')"
    >
      <ul class="notes">
        <li>{{ t('own.topbarNote') }}</li>
        <li>{{ t('own.statusbarNote') }}</li>
      </ul>
    </ShowcaseBlock>
  </ShowcaseSection>
</template>

<style scoped lang="scss">
.label {
  @include abschnitts-label;
}

.hint {
  @include erklaerung;
}

// Der Begriff mit seinem Fragezeichen — eine Zeile, das „?" hängt daneben.
.hintdemo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--font-sm);
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

/*
 * Die Zeilen sind Flex, damit der Pfeil auf der Textmitte sitzt — genau der
 * Fall, für den `align-items: center` gedacht ist. Der Pfeil bringt seine
 * eigene Ausrichtung für den Fließtext mit, hier stört sie nicht.
 */
.caretdemo {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.caretdemo__row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  color: token(--text-secondary);
}

.caretdemo__toggle {
  align-self: flex-start;
  padding: var(--space-1) var(--space-3);
  border: 1px solid token(--border-default);
  border-radius: var(--radius-sm);
  background: transparent;
  color: token(--text-primary);
  font: inherit;
  cursor: pointer;
}
</style>
