<script setup lang="ts">
/**
 * Ein Block innerhalb eines Abschnitts — die Ebene, auf der eine einzelne
 * Komponente vorgeführt wird.
 *
 * Trägt seine Sprungmarke selbst. Vorher standen die Überschriften als nackte
 * `h3` da: Man konnte auf einen Baustein nicht verweisen, und die Leiste oben
 * hätte auf nichts zeigen können.
 */
defineProps<{
  /** Sprungmarke — dieselbe Kennung wie in der Leiste oben. */
  id: string
  title: string
  hint?: string
}>()
</script>

<template>
  <div
    :id="id"
    class="block"
  >
    <h3 class="block__title">
      {{ title }}
    </h3>
    <p
      v-if="hint"
      class="block__hint"
    >
      {{ hint }}
    </p>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.block {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  /* Sonst verschwindet die Überschrift unter der klebenden Kopfzeile. */
  scroll-margin-top: calc(3.5rem + var(--space-6));

  &__title {
    @include abschnitts-label;
  }

  &__hint {
    @include erklaerung;
  }
}
</style>
