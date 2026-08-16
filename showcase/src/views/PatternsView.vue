<script setup lang="ts">
/**
 * Verhaltensmuster — Toasts und die Statuszeile zum Ausprobieren.
 *
 * Die interessante Regel steckt im Toast: Eine Meldung beschreibt einen
 * **Zustand**, kein Ereignis. Sie erscheint, wenn der Zustand eintritt, und
 * verschwindet von selbst, sobald die Ursache behoben ist. Das lässt sich
 * nicht erklären, das muss man einmal umschalten.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NInputNumber, NSwitch } from 'naive-ui'

import { useNotifier } from '@ux/index'
import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t } = useI18n()

/** Anzeigedauer — in einer echten App käme sie aus den Einstellungen. */
const seconds = ref(6)
const { notify } = useNotifier(seconds)

const quotesMissing = ref(false)
const targetsExceeded = ref(false)
const missingCount = ref(3)

notify(quotesMissing, {
  title: t('patterns.quotesMissingTitle'),
  content: () => t('patterns.quotesMissingBody', { count: missingCount.value }),
  type: 'error',
})

notify(targetsExceeded, {
  title: t('patterns.targetsTitle'),
  content: () => t('patterns.targetsBody'),
  type: 'warning',
})

const secondsHint = computed(() =>
  seconds.value === 0 ? t('patterns.secondsZero') : t('patterns.secondsCount', { n: seconds.value }),
)
</script>

<template>
  <ShowcaseSection
    anchor="patterns"
    :title="t('patterns.heading')"
    :hint="t('patterns.hint')"
  >
    <div class="controls">
      <label class="control">
        <span class="control__label">{{ t('patterns.quotesMissingTitle') }}</span>
        <NSwitch v-model:value="quotesMissing" />
      </label>

      <label class="control">
        <span class="control__label">{{ t('patterns.missingCount') }}</span>
        <NInputNumber
          v-model:value="missingCount"
          :min="1"
          :max="99"
          size="small"
        />
      </label>

      <label class="control">
        <span class="control__label">{{ t('patterns.targetsTitle') }}</span>
        <NSwitch v-model:value="targetsExceeded" />
      </label>

      <label class="control">
        <span class="control__label">{{ t('patterns.seconds') }}</span>
        <NInputNumber
          v-model:value="seconds"
          :min="0"
          :max="60"
          size="small"
        />
        <span class="control__hint">{{ secondsHint }}</span>
      </label>
    </div>

    <ul class="rules">
      <li>{{ t('patterns.ruleState') }}</li>
      <li>{{ t('patterns.ruleContent') }}</li>
      <li>{{ t('patterns.ruleDismiss') }}</li>
      <li>{{ t('patterns.ruleZero') }}</li>
    </ul>

    <NButton
      tertiary
      @click="
        () => {
          quotesMissing = false
          targetsExceeded = false
        }
      "
    >
      {{ t('patterns.reset') }}
    </NButton>
  </ShowcaseSection>
</template>

<style scoped lang="scss">
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
}

.control {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  &__label {
    font-size: var(--font-xs);
    text-transform: uppercase;
    letter-spacing: 0.025em;
    color: rgb(var(--text-muted));
  }

  &__hint {
    font-size: var(--font-xs);
    color: rgb(var(--text-secondary));
  }
}

.rules {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-left: var(--space-4);
  max-width: 80ch;
  color: rgb(var(--text-secondary));
  line-height: 1.6;
  list-style: disc;
}
</style>
