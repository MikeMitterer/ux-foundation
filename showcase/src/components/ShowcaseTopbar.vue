<script setup lang="ts">
/**
 * Kopfzeile der Schaufenster-App — benutzt `UxTopbar` aus dem Paket.
 *
 * Bewusst nicht nachgebaut: Eine Schaufenster-App, die ihre eigene Kopfzeile
 * zeichnet, beweist nichts über die Komponente, die sie zeigen soll.
 *
 * Drei Bereiche statt neun Abschnitte: Der Richtwert liegt bei drei bis fünf
 * Menüpunkten. Die Abschnitte stecken darunter in Reitern — genau die Form,
 * die der Skill für so etwas vorsieht.
 *
 * Die Punkte sind echt und nicht nachgestellt: Nur so zeigt sich das
 * Mobil-Verhalten beim Ziehen am Browserrand und nicht bloß eingerahmt im
 * Mobil-Abschnitt.
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
import { AREAS, useSections, type Area } from '@/composables/useSections'

const { t } = useI18n()
const { current, setTheme } = useTheme()
const { activeArea, openArea } = useSections()

const istAktiv = (area: Area): boolean => area.id === activeArea.value

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
      <!--
        Dasselbe Motiv wie in `public/favicon.svg` — drei Schichten, die
        unterste am breitesten. Dort trägt die Datei die Kachel selbst, hier
        liefert sie das Fundament.

        Bewusst **kein** Navigationssymbol: Die vier Motive der Menüpunkte sind
        vergeben, und die Kopfzeile trüge sonst dasselbe Zeichen zweimal.
      -->
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="rgb(var(--brand-contrast))"
      >
        <rect
          x="5"
          y="14.5"
          width="14"
          height="3.5"
          rx="1.2"
        />
        <rect
          x="7"
          y="9.5"
          width="10"
          height="3.5"
          rx="1.2"
          opacity="0.75"
        />
        <rect
          x="9"
          y="4.5"
          width="6"
          height="3.5"
          rx="1.2"
          opacity="0.5"
        />
      </svg>
    </template>

    <template #nav>
      <button
        v-for="area in AREAS"
        :key="area.id"
        type="button"
        class="item"
        :class="{ 'item--active': istAktiv(area) }"
        @click="openArea(area)"
      >
        <UxIcon :name="area.icon" />
        <!-- Unterhalb md fällt die Beschriftung weg, nicht der Punkt. -->
        <span class="item__label">{{ t(`areas.${area.id}`) }}</span>
        <!-- Für Hilfstechnik bleibt sie stehen: ein Symbol ohne Namen ist ein
             Knopf ohne Namen. -->
        <span class="visually-hidden">{{ t(`areas.${area.id}`) }}</span>
        <span
          v-if="istAktiv(area)"
          class="item__underline"
        />
      </button>
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
.item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font: inherit;
  font-size: var(--font-sm);
  color: rgb(var(--text-bar-secondary));
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: rgb(var(--text-bar));
    background: rgb(var(--surface-raised) / 0.5);
  }

  &--active {
    color: rgb(var(--text-bar));
  }

  &__label {
    display: none;

    @include up(md) {
      display: inline;
    }
  }

  /* Ein Strich, kein Kasten — der konkurriert nicht mit den Karten darunter. */
  &__underline {
    position: absolute;
    right: var(--space-2);
    bottom: -4px;
    left: var(--space-2);
    height: 2px;
    border-radius: var(--radius-full);
    background: rgb(var(--accent));
  }
}

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
