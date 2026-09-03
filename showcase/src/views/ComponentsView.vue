<script setup lang="ts">
/**
 * Naive UI, eingefärbt über die Brücke aus den Token.
 *
 * Zweck des Abschnitts: sichtbar machen, dass Fremdkomponenten dieselben
 * Farben tragen wie der Rest. Ohne die Brücke liefen sie farblich daneben her,
 * und das fällt erst in einem anderen Theme auf.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSwitch,
  NTag,
  type DataTableColumns,
} from 'naive-ui'

import SectionIndex, { type IndexItem } from '@/components/SectionIndex.vue'
import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t } = useI18n()

/**
 * Was dieser Abschnitt zeigt — eine Quelle für die Sprungleiste oben und die
 * Karten darunter.
 */
const BLOECKE = [
  { anchor: 'naive-buttons', label: 'Button · Dialog' },
  { anchor: 'naive-inputs', label: 'Input · Select · Switch' },
  { anchor: 'naive-feedback', label: 'Tag · Alert' },
  { anchor: 'naive-table', label: 'DataTable' },
] as const satisfies readonly IndexItem[]

const dialogOpen = ref(false)
const textValue = ref('')
const numberValue = ref<number | null>(42)
const switchValue = ref(true)
const selectValue = ref<string | null>('a')

/*
 * `computed`, nicht Konstante: Beschriftungen, die einmal beim Aufbau
 * ausgewertet werden, bleiben nach einem Sprachwechsel in der alten Sprache
 * stehen — derselbe Fehler wie bei einer Toast-Überschrift als Wert.
 */
const selectOptions = computed(() => [
  { label: t('components.optionAlpha'), value: 'a' },
  { label: t('components.optionBeta'), value: 'b' },
])

interface Row {
  symbol: string
  name: string
  value: number
  change: number
}

/*
 * Ebenfalls `computed`: Naive nimmt die Spaltenköpfe als Wert entgegen, und
 * ein Wert folgt der Sprache nicht. Die Schlüssel gab es schon — `table.value`
 * und `table.change` standen ungenutzt im Katalog, während diese Datei die
 * Wörter selbst tippte.
 */
const columns = computed<DataTableColumns<Row>>(() => [
  { title: t('table.symbol'), key: 'symbol' },
  { title: t('table.name'), key: 'name' },
  { title: t('table.value'), key: 'value', align: 'right' },
  { title: t('table.change'), key: 'change', align: 'right' },
])

const rows: Row[] = [
  { symbol: 'VGWL.DE', name: 'Vanguard FTSE All-World', value: 81800, change: 1.8 },
  { symbol: 'EQQQ.DE', name: 'Invesco Nasdaq-100', value: 31610, change: -0.5 },
  { symbol: '4GLD.DE', name: 'Xetra-Gold', value: 12183, change: 7.0 },
]
</script>

<template>
  <ShowcaseSection
    anchor="components"
    :title="t('components.heading')"
    :hint="t('components.hint')"
  >
    <SectionIndex
      :items="BLOECKE"
      :label="t('index.label')"
    />

    <NCard
      :id="BLOECKE[0].anchor"
      class="card"
    >
      <template #header>
        <h3 class="card__title">
          {{ t('components.buttons') }}
        </h3>
      </template>
      <div class="row">
        <NButton type="primary">
          {{ t('components.confirm') }}
        </NButton>
        <NButton>{{ t('components.cancel') }}</NButton>
        <NButton tertiary>
          {{ t('components.tertiary') }}
        </NButton>
        <NButton type="error">
          {{ t('components.error') }}
        </NButton>
        <NButton @click="dialogOpen = true">
          {{ t('components.openDialog') }}
        </NButton>
      </div>
    </NCard>

    <NCard
      :id="BLOECKE[1].anchor"
      class="card"
    >
      <template #header>
        <h3 class="card__title">
          {{ t('components.inputs') }}
        </h3>
      </template>
      <div class="row">
        <NInput
          v-model:value="textValue"
          :placeholder="t('components.inputPlaceholder')"
        />
        <NInputNumber v-model:value="numberValue" />
        <NSelect
          v-model:value="selectValue"
          :options="selectOptions"
          class="row__select"
        />
        <NSwitch v-model:value="switchValue" />
      </div>
    </NCard>

    <NCard
      :id="BLOECKE[2].anchor"
      class="card"
    >
      <template #header>
        <h3 class="card__title">
          {{ t('components.feedback') }}
        </h3>
      </template>
      <div class="stack">
        <div class="row">
          <NTag type="success">
            {{ t('components.tagOk') }}
          </NTag>
          <NTag type="warning">
            {{ t('components.tagNear') }}
          </NTag>
          <NTag type="error">
            {{ t('components.tagOut') }}
          </NTag>
        </div>
        <NAlert
          type="info"
          :title="t('components.alertTitle')"
        >
          {{ t('components.alertBody') }}
        </NAlert>
      </div>
    </NCard>

    <NCard
      :id="BLOECKE[3].anchor"
      class="card"
    >
      <template #header>
        <h3 class="card__title">
          {{ t('components.table') }}
        </h3>
      </template>
      <NDataTable
        :columns="columns"
        :data="rows"
        :bordered="false"
        size="small"
      />
    </NCard>

    <NModal
      v-model:show="dialogOpen"
      preset="dialog"
      :title="t('components.dialogTitle')"
      :positive-text="t('components.confirm')"
      :negative-text="t('components.cancel')"
    >
      {{ t('components.dialogBody') }}
    </NModal>
  </ShowcaseSection>
</template>

<style scoped lang="scss">
/* Sonst verschwindet der Kartenkopf unter der klebenden Kopfzeile. */
.card {
  scroll-margin-top: calc(3.5rem + var(--space-6));

  /*
   * Der Titel steht über den `#header`-Slot und nicht über das `title`-Prop:
   * Naive rendert das Prop als `<div>`, und damit hatte diese Ansicht sichtbare
   * Überschriften, die für Hilfstechnik keine waren — die Gliederung des
   * Abschnitts fiel unter den Tisch. Der Reiter „Eigene" macht es über
   * `ShowcaseBlock` längst richtig; hier zog es nach.
   *
   * Gestaltet wird es hier **nicht**: Ein `h3` trägt seine Stufe aus
   * `styles/reset.css` im Paket, in jeder App gleich. Eine Regel an dieser
   * Stelle wäre genau die Kopie, die das Fundament abschaffen soll.
   */
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);

  &__select { min-width: 10rem; }
}

.stack { display: flex; flex-direction: column; gap: var(--space-3); }
</style>
