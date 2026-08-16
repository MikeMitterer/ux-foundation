<script setup lang="ts">
/**
 * Der Rahmen einer App: Kopfzeile oben, Inhalt dazwischen, Statuszeile unten.
 *
 * Sieht nach nichts aus und löst trotzdem einen Fehler, den jede App sonst
 * einmal selbst macht. `position: sticky` allein genügt für die Statuszeile
 * **nicht**: Sticky hält ein Element im Bild, solange sein umschließender
 * Block sichtbar ist — ist die Seite kürzer als das Fenster, gibt es nichts
 * zu halten, und die Leiste endet dort, wo der Inhalt endet. Gemessen an
 * einer leeren Ansicht: Seite 679 px, Fenster 1094 px, Leiste mitten im Bild.
 *
 * Deshalb beides: Diese Spalte ist mindestens so hoch wie das Fenster und
 * lässt den Inhalt wachsen — damit sitzt die Leiste auch auf kurzen Seiten
 * unten. Auf langen Seiten übernimmt dann wieder das Sticky der Leiste selbst.
 */
</script>

<template>
  <div class="ux-shell">
    <slot name="topbar" />

    <div class="ux-shell__main">
      <slot />
    </div>

    <slot name="statusbar" />
  </div>
</template>

<style scoped lang="scss">
.ux-shell {
  display: flex;
  flex-direction: column;
  /*
   * `dvh` statt `vh`: Auf dem Telefon blendet der Browser seine Leisten beim
   * Scrollen ein und aus. `100vh` rechnet mit der *größten* Höhe — die
   * Statuszeile liegt dann angeschnitten unter dem Rand, solange die
   * Browserleiste sichtbar ist. `dvh` folgt der tatsächlichen Höhe.
   */
  min-height: 100dvh;

  &__main {
    /* Wächst in die Lücke — das ist der ganze Trick. */
    flex: 1 1 auto;
    min-width: 0;
  }
}
</style>
