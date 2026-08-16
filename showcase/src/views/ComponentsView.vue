<script setup lang="ts">
/**
 * Naive UI, eingefärbt über die Brücke aus den Token.
 *
 * Zweck des Abschnitts: sichtbar machen, dass Fremdkomponenten dieselben
 * Farben tragen wie der Rest. Ohne die Brücke liefen sie farblich daneben her,
 * und das fällt erst in einem anderen Theme auf.
 */
import { ref } from 'vue'
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

import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t } = useI18n()

const dialogOpen = ref(false)
const textValue = ref('')
const numberValue = ref<number | null>(42)
const switchValue = ref(true)
const selectValue = ref<string | null>('a')

const selectOptions = [
  { label: 'Alpha', value: 'a' },
  { label: 'Beta', value: 'b' },
]

interface Row {
  symbol: string
  name: string
  value: number
  change: number
}

const columns: DataTableColumns<Row> = [
  { title: 'Symbol', key: 'symbol' },
  { title: 'Name', key: 'name' },
  { title: 'Wert', key: 'value', align: 'right' },
  { title: 'Veränderung', key: 'change', align: 'right' },
]

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
    <NCard
      :title="t('components.buttons')"
      size="small"
    >
      <div class="row">
        <NButton type="primary">
          {{ t('components.confirm') }}
        </NButton>
        <NButton>{{ t('components.cancel') }}</NButton>
        <NButton tertiary>
          Tertiär
        </NButton>
        <NButton type="error">
          Fehler
        </NButton>
        <NButton @click="dialogOpen = true">
          {{ t('components.openDialog') }}
        </NButton>
      </div>
    </NCard>

    <NCard
      :title="t('components.inputs')"
      size="small"
    >
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
      :title="t('components.feedback')"
      size="small"
    >
      <div class="stack">
        <div class="row">
          <NTag type="success">
            OK
          </NTag>
          <NTag type="warning">
            Knapp
          </NTag>
          <NTag type="error">
            Außerhalb
          </NTag>
        </div>
        <NAlert
          type="info"
          title="Hinweis"
        >
          Die Farben stammen aus denselben Token wie der Rest der Seite.
        </NAlert>
      </div>
    </NCard>

    <NCard
      :title="t('components.table')"
      size="small"
    >
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
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);

  &__select { min-width: 10rem; }
}

.stack { display: flex; flex-direction: column; gap: var(--space-3); }
</style>
