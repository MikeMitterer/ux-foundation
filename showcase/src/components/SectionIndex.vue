<script setup lang="ts">
/**
 * Was in diesem Abschnitt steht — als Sprungleiste ganz oben.
 *
 * Der Grund ist der Aufbau der Seite: Ein Abschnitt zeigt mehrere Bausteine
 * untereinander, und wer einen bestimmten sucht, scrollte bisher daran vorbei.
 * Die Leiste beantwortet zwei Fragen auf einmal — *was* ist hier drin, und
 * *wo* steht es.
 *
 * Bewusst im Schaufenster und nicht im Paket: Sie beschreibt diese eine Seite.
 * Braucht sie eine zweite App, zieht sie um.
 */
export interface IndexItem {
  /** Sprungmarke des Blocks — muss zur `id` eines `ShowcaseBlock` passen. */
  anchor: string
  /** Name des Bausteins, meist der Komponentenname. */
  label: string
}

defineProps<{
  items: readonly IndexItem[]
  /** Beschriftung der Leiste, bereits übersetzt. */
  label: string
}>()

/**
 * Springt zum Block, **ohne die Adresse anzufassen**.
 *
 * Der Grund ist keine Feinheit: Diese App führt ihre Reiter über den Hash
 * (`#/components`). Ein gewöhnlicher Sprunglink schriebe `#own-nav` hinein,
 * `hashchange` feuerte, und der Reiter-Zustand läse daraus einen unbekannten
 * Reiter — die Seite spränge auf den ersten Abschnitt zurück, statt zum Block
 * zu scrollen. Genau das passiert, wenn Sprungmarken und Reiter sich dieselbe
 * Adresszeile teilen.
 */
function springe(anchor: string): void {
  document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <nav
    class="index"
    :aria-label="label"
  >
    <span class="index__label">{{ label }}</span>
    <ul class="index__list">
      <li
        v-for="item in items"
        :key="item.anchor"
      >
        <a
          class="index__link"
          :href="`#${item.anchor}`"
          @click.prevent="springe(item.anchor)"
        >{{ item.label }}</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
.index {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2) var(--space-3);
  padding: var(--space-3) var(--space-4);
  @include card-surface(--surface-sunken);

  /* Ein Etikett, keine Überschrift — es benennt die Leiste, gliedert aber
     nichts. Deshalb ein `span` mit dem Mixin aus dem Paket und kein `h*`. */
  &__label {
    @include gruppen-label;
    margin-bottom: 0;
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__link {
    display: inline-block;
    padding: 0.125rem var(--space-2);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    color: rgb(var(--accent));
    text-decoration: none;

    &:hover {
      background: rgb(var(--surface-raised));
    }
  }
}
</style>
