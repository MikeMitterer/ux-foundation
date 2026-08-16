<script setup lang="ts">
/**
 * Kopfzeile der Schaufenster-App — benutzt `UxTopbar` aus dem Paket.
 *
 * Bewusst nicht nachgebaut: Eine Schaufenster-App, die ihre eigene Kopfzeile
 * zeichnet, beweist nichts über die Komponente, die sie zeigen soll.
 *
 * Die Abschnitte stecken in Reitern und nicht hier: Sieben Menüpunkte lägen
 * über dem Richtwert von drei bis fünf, und es sind ohnehin keine
 * Arbeitsbereiche, sondern Kapitel einer Seite.
 *
 * Der Theme-Umschalter steht hier **entgegen** der Regel, dass er in die
 * Einstellungen gehört. Diese App handelt von Themes — er ist ihr
 * Arbeitsmittel, nicht Konfiguration. Eine Ausnahme mit Grund, und der Grund
 * steht hier, damit ihn niemand für Nachlässigkeit hält.
 *
 * `NSelect` und **kein** natives `select`: Das native zeichnet das
 * Betriebssystem, nicht das Theme — daneben sieht jede Naive-Komponente aus
 * wie aus einer anderen App. Dieselbe Regel wie bei Symbolen: zwei Sprachen in
 * einer Zeile sieht man sofort, auch wenn man nicht sagen kann, woran es liegt.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NSelect } from 'naive-ui'

import { THEME_IDS, THEMES, UxIcon, UxTopbar, type ThemeId } from '@ux/index'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { current, setTheme } = useTheme()

/**
 * Auswahlliste mit Farbtupfer je Theme.
 *
 * Die Vorschaufarben stehen fest in `THEMES` und werden nicht aus den
 * Variablen gelesen: Die Token eines *nicht aktiven* Themes stehen im Dokument
 * gar nicht zur Verfügung.
 */
const themeOptions = computed(() =>
  THEME_IDS.map((id) => ({
    label: id,
    value: id,
    preview: THEMES[id].preview,
  })),
)
</script>

<template>
  <UxTopbar
    :brand-lead="t('app.brandLead')"
    :brand-accent="t('app.brandAccent')"
    href="#/themes"
  >
    <template #badge>
      <UxIcon
        name="dashboard"
        :size="16"
        :stroke-width="2.5"
      />
    </template>

    <template #actions>
      <NSelect
        :value="current"
        :options="themeOptions"
        :consistent-menu-width="false"
        size="small"
        class="theme-select"
        :aria-label="t('themes.switchLabel')"
        @update:value="setTheme($event as ThemeId)"
      >
        <template #arrow>
          <UxIcon
            name="settings"
            :size="14"
          />
        </template>
      </NSelect>
    </template>
  </UxTopbar>
</template>

<style scoped lang="scss">
.theme-select {
  /*
   * Breit genug für den längsten Namen („mangolila"), damit die Zeile beim
   * Wechsel nicht springt — mehr wäre verschenkter Platz. Die Liste selbst
   * darf breiter werden (`consistent-menu-width: false`).
   */
  width: 7.5rem;

  @include below(sm) {
    width: 6rem;
  }
}
</style>
