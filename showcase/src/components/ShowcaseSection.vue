<script setup lang="ts">
/** Rahmen eines Abschnitts: Überschrift, erklärender Satz, Inhalt. */
defineProps<{
  title: string
  hint?: string
  anchor: string
}>()
</script>

<template>
  <section
    :id="anchor"
    class="section"
  >
    <header class="section__head">
      <h2 class="section__title">
        {{ title }}
      </h2>
      <p
        v-if="hint"
        class="section__hint"
      >
        {{ hint }}
      </p>
    </header>
    <div class="section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  scroll-margin-top: var(--space-8);

  &__title {
    font-family: var(--font-display);
    font-size: var(--font-xl);
    font-weight: 600;
    letter-spacing: -0.015em;
  }

  &__hint {
    max-width: 70ch;
    margin-top: var(--space-2);
    color: rgb(var(--text-secondary));
    line-height: 1.6;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
}
</style>
