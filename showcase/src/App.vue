<script setup lang="ts">
/**
 * Schaufenster-App.
 *
 * Eine Seite, darin Reiter — über die Adresse ansteuerbar. Grundlagen und
 * Komponenten stehen bewusst nicht untereinander: Wer die Schrift ansieht,
 * will nicht an Knöpfen vorbeiscrollen, und umgekehrt.
 *
 * Der Nutzen der App liegt im Theme-Umschalter oben rechts: Ein Fehler in
 * einer Palette fällt hier in Sekunden auf, in einer echten App erst Wochen
 * später.
 */
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  NConfigProvider,
  NNotificationProvider,
  NTabPane,
  NTabs,
  darkTheme,
  dateDeDE,
  deDE,
  type GlobalThemeOverrides,
} from "naive-ui";

import {
  buildNaiveOverrides,
  THEMES,
  UxAppShell,
  UxStatusBar,
} from "@ux/index";
import ShowcaseTopbar from "@/components/ShowcaseTopbar.vue";
import ComponentsView from "@/views/ComponentsView.vue";
import IconsView from "@/views/IconsView.vue";
import MobileView from "@/views/MobileView.vue";
import OwnComponentsView from "@/views/OwnComponentsView.vue";
import PatternsView from "@/views/PatternsView.vue";
import ScalesView from "@/views/ScalesView.vue";
import ThemesView from "@/views/ThemesView.vue";
import TokensView from "@/views/TokensView.vue";
import TypographyView from "@/views/TypographyView.vue";
import { AREAS, useSections } from "@/composables/useSections";
import { useTheme } from "@/composables/useTheme";

const { t, locale } = useI18n();

/** Welcher Abschnitt welche Ansicht zeigt. */
const ANSICHTEN = {
  themes: ThemesView,
  tokens: TokensView,
  scales: ScalesView,
  typography: TypographyView,
  icons: IconsView,
  components: ComponentsView,
  own: OwnComponentsView,
  mobile: MobileView,
  patterns: PatternsView,
};
const { current } = useTheme();

const { section, setSection, activeArea } = useSections();

/** Nur die Reiter des gerade offenen Bereichs. */
const sichtbareAbschnitte = computed(
  () => AREAS.find((area) => area.id === activeArea.value)?.sections ?? [],
);

const isDark = computed(() => THEMES[current.value].isDark);
const naiveOverrides = ref<GlobalThemeOverrides>({});

/*
 * Die Overrides werden aus den *gesetzten* CSS-Variablen gelesen. Deshalb erst
 * nach dem Neuzeichnen: Vorher steht am Wurzelelement noch das alte
 * `data-theme`, und Naive UI bekäme die Farben des vorherigen Anstrichs.
 */
watch(
  current,
  async () => {
    await nextTick();
    naiveOverrides.value = buildNaiveOverrides();
  },
  { immediate: true },
);
</script>

<template>
  <NConfigProvider
    :theme="isDark ? darkTheme : null"
    :theme-overrides="naiveOverrides"
    :locale="deDE"
    :date-locale="dateDeDE"
  >
    <!--
      Der Provider muss über allem stehen, was `useNotification()` aufruft —
      sonst findet der Toast keinen Anker und Naive UI meldet es nur in der
      Konsole.
    -->
    <NNotificationProvider :max="3">
      <UxAppShell>
        <template #topbar>
          <ShowcaseTopbar />
        </template>

        <main class="page">
          <p class="intro">
            {{ t("app.intro") }}
          </p>

          <!--
          `key` an der Sprache: Naive UI berechnet die Position des
          Schiebebalkens einmal beim Einhängen. Ändern sich die Beschriftungen,
          bleibt er stehen, wo er war — und zwar bis irgendetwas anderes eine
          Neuberechnung auslöst.
        -->
          <NTabs
            :key="locale"
            :value="section"
            type="line"
            animated
            @update:value="setSection($event)"
          >
            <NTabPane
              v-for="id in sichtbareAbschnitte"
              :key="id"
              :name="id"
              :tab="t(`nav.${id}`)"
            >
              <component :is="ANSICHTEN[id]" />
            </NTabPane>
          </NTabs>
        </main>

        <template #statusbar>
          <UxStatusBar
            :app-name="t('app.title')"
            :powered-by-label="t('status.poweredBy')"
            origin-name="MangoLila"
            origin-href="https://www.mangolila.at/"
            :context="t('status.context')"
            :data-age="t('status.quotes')"
            :version="t('status.version')"
            backend-host="stockinfo.int.mikemitterer.at"
            backend-state="online"
            backend-version="0.5.0"
            :backend-state-label="t('status.online')"
          />
        </template>
      </UxAppShell>
    </NNotificationProvider>
  </NConfigProvider>
</template>

<style scoped lang="scss">
.intro {
  max-width: 70ch;
  color: rgb(var(--text-secondary));
  line-height: 1.6;
}
</style>
