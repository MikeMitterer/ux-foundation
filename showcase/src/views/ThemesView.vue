<script setup lang="ts">
/** Alle Paletten als Kacheln — Klick wechselt den Anstrich der ganzen Seite. */
import { useI18n } from 'vue-i18n'

import { THEME_IDS, THEMES } from '@ux/index'
import ShowcaseSection from '@/components/ShowcaseSection.vue'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { current, setTheme } = useTheme()
</script>

<template>
  <ShowcaseSection
    anchor="themes"
    :title="t('themes.heading')"
    :hint="t('themes.hint')"
  >
    <ul class="tiles">
      <li
        v-for="id in THEME_IDS"
        :key="id"
      >
        <button
          class="tile"
          :class="{ 'tile--active': id === current }"
          :aria-pressed="id === current"
          @click="setTheme(id)"
        >
          <span
            class="tile__preview"
            :style="{ background: THEMES[id].preview.page }"
          >
            <span
              class="tile__card"
              :style="{ background: THEMES[id].preview.card }"
            />
            <span
              class="tile__ink"
              :style="{ background: THEMES[id].preview.ink }"
            />
            <span
              class="tile__accent"
              :style="{ background: THEMES[id].preview.accent }"
            />
          </span>
          <span class="tile__name">
            {{ id }}
            <span
              v-if="id === current"
              class="tile__active"
            >{{ t('themes.active') }}</span>
          </span>
        </button>
      </li>
    </ul>
  </ShowcaseSection>
</template>

<style scoped lang="scss">
.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
  list-style: none;
}

.tile {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-2);
  border: 1px solid rgb(var(--border-subtle));
  border-radius: var(--radius-lg);
  background: rgb(var(--surface-card));
  cursor: pointer;
  text-align: left;

  &:hover { border-color: rgb(var(--border-default)); }

  &--active { border-color: rgb(var(--accent)); }

  &__preview {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 2.5rem;
    padding: 0 var(--space-2);
    border-radius: var(--radius-sm);
    border: 1px solid rgb(var(--border-subtle));
  }

  &__card { flex: 1; height: 1.25rem; border-radius: 3px; }
  &__ink  { width: 6px; height: 1.5rem; border-radius: 2px; }
  &__accent { width: 10px; height: 1.5rem; border-radius: 2px; }

  &__name {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-sm);
  }

  &__active {
    font-size: var(--font-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(var(--accent));
  }
}
</style>
