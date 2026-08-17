<script setup lang="ts">
/**
 * Verhaltensmuster — Toasts und die Statuszeile zum Ausprobieren.
 *
 * Die interessante Regel steckt im Toast: Eine Meldung beschreibt einen
 * **Zustand**, kein Ereignis. Sie erscheint, wenn der Zustand eintritt, und
 * verschwindet von selbst, sobald die Ursache behoben ist. Das lässt sich
 * nicht erklären, das muss man einmal umschalten.
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NInputNumber, NSwitch } from 'naive-ui'

import { useNotifier } from '@ux/index'
import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t } = useI18n()

/** Anzeigedauer — in einer echten App käme sie aus den Einstellungen. */
const seconds = ref(6)

/*
 * Die Beschriftung des Zählers kommt aus dem Katalog dieser App, nicht aus dem
 * Fundament: Ein Paket hat keinen Katalog, und ein fest verdrahtetes „schließt
 * in 4 s" wäre in der zweiten Sprache sofort falsch.
 */
const { notify } = useNotifier(seconds, (n) => t('patterns.closesIn', { n }))

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

/*
 * Der Stapel-Versuch: mehrere Meldungen kurz hintereinander.
 *
 * Zwei Dinge sieht man nur so und an keinem einzelnen Toast — wo der **erste**
 * aufgeht (unter den Bedienelementen der Kopfzeile, nicht auf ihnen), und was
 * `:max` tut, wenn mehr Zustände gleichzeitig gelten als Platz ist: Beim
 * Anlegen der vierten weicht die älteste.
 *
 * Beim **wiederholten** Auslösen kann es mehr als drei werden. Das ist keine
 * Absicht, sondern Naives Buchführung: Es prüft das Höchstmaß gegen die Zahl
 * der noch nicht abgeräumten Meldungen, und was der Zähler geschlossen hat,
 * zählt dort weiter mit. Wer den Versuch sauber sehen will, lädt neu.
 *
 * Fünf gegen ein Höchstmaß von drei ist mit Absicht mehr, als angezeigt werden
 * kann. Genau der Fall ist der interessante.
 *
 * Auch der Stapel läuft über Zustände, nicht über abgefeuerte Ereignisse — das
 * ist die Regel des Hauses, und ein Versuch, der sie umgeht, führte etwas vor,
 * das es so nicht gibt. Gestaffelt werden deshalb die Zustände, nicht die
 * Meldungen.
 */
const STAPEL_GROESSE = 5
const STAPEL_ABSTAND_MS = 600

const stapel = Array.from({ length: STAPEL_GROESSE }, () => ref(false))
const stapelTimer: ReturnType<typeof setTimeout>[] = []

stapel.forEach((aktiv, index) => {
  notify(aktiv, {
    title: t('patterns.stackTitle', { n: index + 1 }),
    content: () => t('patterns.stackBody', { n: index + 1, max: STAPEL_GROESSE }),
    type: 'info',
  })
})

/** Löscht laufende Zeitgeber und nimmt alle Zustände des Stapels zurück. */
function stapelZuruecksetzen(): void {
  for (const timer of stapelTimer) clearTimeout(timer)
  stapelTimer.length = 0
  for (const aktiv of stapel) aktiv.value = false
}

/** Schaltet die Zustände gestaffelt ein, damit man das Nachrücken sieht. */
function stapelAusloesen(): void {
  stapelZuruecksetzen()
  stapel.forEach((aktiv, index) => {
    stapelTimer.push(
      setTimeout(() => {
        aktiv.value = true
      }, index * STAPEL_ABSTAND_MS),
    )
  })
}

/** Nimmt jeden Zustand zurück — auch die des Stapels. */
function allesZuruecksetzen(): void {
  quotesMissing.value = false
  targetsExceeded.value = false
  stapelZuruecksetzen()
}

/*
 * Ohne das feuert ein Zeitgeber noch, wenn die Ansicht schon gewechselt ist —
 * und setzt einen Zustand einer Komponente, die es nicht mehr gibt.
 */
onBeforeUnmount(stapelZuruecksetzen)
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
      <li>{{ t('patterns.ruleProgress') }}</li>
      <li>{{ t('patterns.ruleStack') }}</li>
    </ul>

    <!--
      Der Stapel-Versuch steht bewusst als eigene Handlung da und nicht als
      weiterer Schalter: Er zeigt nicht einen Zustand, sondern was passiert,
      wenn mehrere gleichzeitig gelten.
    -->
    <div class="actions">
      <NButton
        type="primary"
        @click="stapelAusloesen"
      >
        {{ t('patterns.stackTrigger', { n: STAPEL_GROESSE }) }}
      </NButton>

      <NButton
        tertiary
        @click="allesZuruecksetzen"
      >
        {{ t('patterns.reset') }}
      </NButton>
    </div>

    <p class="stack-hint">
      {{ t('patterns.stackHint') }}
    </p>
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

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.stack-hint {
  max-width: 80ch;
  font-size: var(--font-sm);
  color: rgb(var(--text-muted));
  line-height: 1.6;
}
</style>
