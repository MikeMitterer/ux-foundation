<script setup lang="ts">
/**
 * Ein Punkt in der Hauptnavigation.
 *
 * Symbol **und** Beschriftung, in einer Zeile mit dem Rest der Kopfzeile.
 * Unterhalb `md` fällt die Beschriftung weg, **nicht** der Punkt: Vier Symbole
 * passen auf jedes Telefon, und die Navigation bleibt damit einen Griff
 * entfernt statt zwei. Der Text wandert dabei in eine für Hilfstechnik
 * lesbare Beschriftung — ein Symbol ohne zugänglichen Namen ist ein Knopf
 * ohne Namen.
 *
 * Der aktive Punkt trägt einen Strich in der Akzentfarbe, keinen eingefärbten
 * Kasten: Eine Fläche dahinter konkurriert mit den Karten darunter.
 *
 * **Navigiert wird hier nicht.** Die eine App hat einen Router, die andere
 * Hash-Tabs — was ein Klick bedeutet, weiß nur sie. Deshalb kommt die Adresse
 * herein und das Ereignis heraus.
 */
import { computed } from 'vue'

import UxIcon from '../icons/UxIcon.vue'
import type { NavIconName } from '../icons/navIcons'

const props = withDefaults(
  defineProps<{
    /** Symbol aus dem gemeinsamen Satz. */
    icon: NavIconName
    /** Sichtbare Beschriftung — bereits übersetzt. */
    label: string
    active?: boolean
    /**
     * Ziel des Verweises.
     *
     * Mit Adresse entsteht ein echtes `a`: Mittelklick und „in neuem Tab
     * öffnen" funktionieren dann. Ohne Adresse ein `button` — ein `a` ohne
     * `href` ist für die Tastatur nicht erreichbar.
     */
    href?: string
  }>(),
  { active: false, href: undefined },
)

const emit = defineEmits<{
  (event: 'select'): void
}>()

const tag = computed(() => (props.href ? 'a' : 'button'))
</script>

<template>
  <component
    :is="tag"
    class="ux-navitem"
    :class="{ 'ux-navitem--active': active }"
    :href="href"
    :type="href ? undefined : 'button'"
    :aria-current="active ? 'page' : undefined"
    @click="emit('select')"
  >
    <UxIcon :name="icon" />
    <span class="ux-navitem__label">{{ label }}</span>
    <span class="visually-hidden">{{ label }}</span>
    <span
      v-if="active"
      class="ux-navitem__underline"
    />
  </component>
</template>

<style scoped lang="scss">
@use '../styles/shared' as *;

.ux-navitem {
  position: relative;
  @include row(0.375rem);
  padding: 0.375rem var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-family: inherit;
  font-size: var(--font-sm);
  line-height: inherit;
  color: token(--text-bar-secondary);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    background-color: token(--surface-raised);
    color: token(--text-bar);
  }

  &--active {
    color: token(--text-bar);
  }
}

.ux-navitem__label {
  display: none;

  @include up(md) { display: inline; }
}

/*
 * Ein Strich, kein Kasten: Eine eingefärbte Fläche hinter dem aktiven Punkt
 * konkurriert mit den Karten darunter.
 */
.ux-navitem__underline {
  position: absolute;
  right: var(--space-2);
  bottom: -9px;
  left: var(--space-2);
  height: 2px;
  border-radius: var(--radius-full);
  background-color: token(--accent);
}
</style>
