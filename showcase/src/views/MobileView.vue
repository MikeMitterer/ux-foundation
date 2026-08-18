<script setup lang="ts">
/**
 * Mobil-Verhalten der Kopfzeile — nebeneinander bei drei Breiten.
 *
 * Warum iframes und keine verkleinerten Nachbauten: `@media`-Abfragen richten
 * sich nach dem **Fenster**, nicht nach dem Element. Eine Miniatur in einem
 * 375 Pixel breiten Kasten würde die Regeln der vollen Fensterbreite anzeigen
 * und damit genau das Gegenteil von dem beweisen, was sie behauptet. Ein
 * iframe hat ein eigenes Fenster — dort greifen die Regeln echt.
 *
 * Gezeigt wird das, was der Skill verlangt: Unterhalb `md` fällt die
 * **Beschriftung** weg, nicht der Menüpunkt. Unterhalb `sm` fällt zusätzlich
 * die Wortmarke, die Plakette bleibt. Keinen Hamburger — vier Symbole passen
 * auf jedes Telefon, und ein Hamburger kostete einen zusätzlichen Griff.
 */
import { useI18n } from 'vue-i18n'

import ShowcaseSection from '@/components/ShowcaseSection.vue'

const { t } = useI18n()

/** Die Breiten, bei denen sich etwas ändert — plus eine als Bezug. */
const BREITEN = [
  { px: 375, key: 'phone' },
  { px: 720, key: 'small' },
  { px: 1100, key: 'desktop' },
] as const
</script>

<template>
  <ShowcaseSection
    anchor="mobile"
    :title="t('mobile.heading')"
    :hint="t('mobile.hint')"
  >
    <ul class="frames">
      <li
        v-for="breite in BREITEN"
        :key="breite.px"
        class="frame"
      >
        <div class="frame__head">
          <span class="frame__width">{{ breite.px }} px</span>
          <span class="frame__label">{{ t(`mobile.${breite.key}`) }}</span>
        </div>
        <!--
          `?demo=nav` rendert im selben Bündel nur die Kopfzeile — kein
          zweites Projekt, keine zweite Wahrheit.
        -->
        <iframe
          class="frame__view"
          :style="{ width: `${breite.px}px` }"
          :title="t(`mobile.${breite.key}`)"
          src="?demo=nav"
          loading="lazy"
        />
      </li>
    </ul>

    <ul class="rules">
      <li>{{ t('mobile.ruleLabels') }}</li>
      <li>{{ t('mobile.ruleWordmark') }}</li>
      <li>{{ t('mobile.ruleHamburger') }}</li>
      <li>{{ t('mobile.ruleA11y') }}</li>
    </ul>
  </ShowcaseSection>
</template>

<style scoped lang="scss">
.frames {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  list-style: none;
}

.frame {
  /* Die Rahmen sind breiter als der Inhaltsstreifen — hier und nur hier ist
     waagrechtes Rollen erwünscht, sonst sähe man die 1100 px nie. */
  overflow-x: auto;

  &__head {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  &__width {
    @include gruppen-label;
    margin-bottom: 0;
  }

  &__label {
    font-size: var(--font-xs);
    color: rgb(var(--text-secondary));
  }

  &__view {
    height: 4.5rem;
    border: 1px solid rgb(var(--border-default));
    border-radius: var(--radius-lg);
    background: rgb(var(--surface-page));
    display: block;
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
