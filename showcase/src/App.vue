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
  NTabPane,
  NTabs,
  darkTheme,
  dateDeDE,
  dateEnGB,
  deDE,
  enGB,
  type GlobalThemeOverrides,
} from "naive-ui";

import {
  buildNaiveOverrides,
  THEMES,
  UxAppShell,
  UxNotificationProvider,
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
 * Naive UI bringt seinen eigenen Katalog mit — „Confirm" und „Cancel" stehen
 * nicht in unserem. Ohne das hier bliebe er auf der Sprache stehen, mit der
 * die App startet, und in einer englischen Oberfläche stünde „Abbrechen".
 *
 * `enGB` und nicht `enUS`: Ein Datum als 08/11/2026 ist für alle außer den USA
 * eine Falle. Zu Deutsch gibt es nur `deDE`; für Zahlen und Datum ist es von
 * österreichischem Deutsch nicht zu unterscheiden.
 */
const naiveLocale = computed(() => (locale.value === "en" ? enGB : deDE));
const naiveDateLocale = computed(() =>
  locale.value === "en" ? dateEnGB : dateDeDE,
);

const tabs = ref<InstanceType<typeof NTabs> | null>(null);

/*
 * Fremdkomponenten messen beim Einhängen — und rechnen danach nur bei den
 * Ereignissen nach, die sie selbst kennen. Ein Sprachwechsel gehört nicht dazu:
 * Die Beschriftungen werden länger oder kürzer, der Schiebebalken unter dem
 * aktiven Reiter bleibt aber stehen, wo er war.
 *
 * `nextTick`, weil erst nach dem Neuzeichnen die neuen Breiten im Dokument
 * stehen; vorher misst Naive die alten.
 */
watch(locale, async () => {
  await nextTick();
  tabs.value?.syncBarPosition();
});

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
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
  >
    <!--
      Der Provider muss über allem stehen, was `useNotification()` aufruft —
      sonst findet der Toast keinen Anker und Naive UI meldet es nur in der
      Konsole.

      `UxNotificationProvider` statt `NNotificationProvider`: Er bringt den
      Versatz unter die Bedienelemente der Kopfzeile mit. Ohne ihn öffnete der
      erste Toast über dem Theme-Umschalter oben rechts — dem einen
      Bedienelement, das diese App ausmacht.
    -->
    <UxNotificationProvider>
      <UxAppShell>
        <template #topbar>
          <ShowcaseTopbar />
        </template>

        <main class="page">
          <p class="intro">
            {{ t("app.intro") }}
          </p>

          <!--
            `key` **nur** am Bereich, nicht an der Sprache.

            Beim Bereichswechsel tauscht der ganze *Satz* an Reitern. Ohne den
            Schlüssel blieb die alte Reiter-Fläche im Dokument stehen — sichtbar
            als zwei Abschnitte übereinander, während oben schon der neue Reiter
            markiert war. Vertretbar, weil die Reiter selbst keinen Zustand
            halten: Welcher offen ist, steht in der Adresse.

            Die Sprache stand hier einmal mit im Schlüssel, weil Naive den
            Schiebebalken nur beim Einhängen rechnet und er nach einem
            Sprachwechsel neben der Beschriftung stand. Das ist zurückgenommen:
            Der Schlüssel baut die **ganze Fläche** neu auf, und damit stirbt
            der Zustand *in* den Ansichten mit. Sichtbar wurde es genau an der
            Ansicht, die den Sprachwechsel vorführen soll — beim Umschalten
            sprang der Zustandsschalter im Reiter „Verhalten" zurück, der offene
            Toast verlor seinen Anker und blieb in der alten Sprache stehen.

            Stattdessen wird unten gezielt nachgerechnet: derselbe Effekt, ohne
            Abriss.
          -->
          <NTabs
            ref="tabs"
            :key="activeArea"
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
    </UxNotificationProvider>
  </NConfigProvider>
</template>

<style scoped lang="scss">
.intro {
  max-width: 70ch;
  color: rgb(var(--text-secondary));
  line-height: 1.6;
}
</style>
