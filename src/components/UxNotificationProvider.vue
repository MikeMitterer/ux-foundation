<script setup lang="ts">
/**
 * Der Toast-Anker einer App — mit dem Versatz, den die Kopfzeile verlangt.
 *
 * Naive UI setzt Meldungen von sich aus 12 Pixel unter den oberen Rand, also
 * **über** die klebende Kopfzeile. Da Fehler stehen bleiben, bis sie
 * weggeklickt werden, liegt deren rechte Gruppe damit dauerhaft unter einer
 * Meldung — in StockInfo traf es „Aktualisieren", im Schaufenster den
 * Theme-Umschalter. Zweimal derselbe Fehler aus derselben Ursache: Genau
 * deshalb steht der Versatz jetzt hier und nicht in jeder App.
 *
 * Ausgewichen wird den **Bedienelementen**, nicht der Leiste: Sie zentriert
 * ihren Inhalt, das untere Stück ist leer, und dort verdeckt eine Meldung
 * nichts mehr. Die Zahl kommt aus `--toast-top` und leitet sich aus
 * `--topbar-height` ab. Eine App, die den Wert von Hand nachrechnet, hat eine
 * zweite Quelle für dieselbe Höhe — und die eine wandert irgendwann.
 *
 * Verwendet wird er statt `NNotificationProvider`, über allem, was
 * `useNotifier()` aufruft:
 *
 * ```vue
 * <UxNotificationProvider>
 *   <AppDashboard />
 * </UxNotificationProvider>
 * ```
 */
import { NNotificationProvider } from 'naive-ui'

withDefaults(
  defineProps<{
    /**
     * Wie viele Meldungen höchstens gleichzeitig stehen.
     *
     * Drei ist Absicht: Fallen mehrere Quellen gleichzeitig aus, soll daraus
     * keine Stapel-Lawine werden, die den halben Bildschirm deckt.
     */
    max?: number
  }>(),
  { max: 3 },
)

/*
 * Als CSS-Variable und nicht als ausgerechneter Wert: Der Container hängt am
 * `body`, die Token stehen am Wurzelelement — `var()` löst dort auf, und eine
 * geänderte Kopfzeilenhöhe wirkt ohne Zutun mit.
 */
const CONTAINER_STYLE = { top: 'var(--toast-top)' }
</script>

<template>
  <NNotificationProvider
    :max="max"
    :container-style="CONTAINER_STYLE"
  >
    <slot />
  </NNotificationProvider>
</template>

<!--
  Bewusst **ohne** `scoped`.

  Der Toast hängt am `body`, nicht in dieser Komponente — ein Scope-Merkmal
  erreicht ihn nicht. Dasselbe gilt für den Balken selbst: Er entsteht in
  `useStateNotification` über `h()`, und was dort entsteht, trägt das Merkmal
  ebenfalls nicht zuverlässig. `ux-standards` sieht für genau diesen Fall eine
  bewusst globale Regel mit eigenem Präfix vor.

  Diese Vorlage ist nicht nur Aussehen: `useStateNotification` blendet die
  Meldung aus, wenn die Animation des Balkens durch ist. Fehlt sie, bleibt der
  Toast stehen — deshalb steht dort ausdrücklich, dass dieser Provider und
  nicht `NNotificationProvider` zu verwenden ist.

  Die einzige Zeile, die eine **fremde** Klasse anfasst, ist `.n-notification`.
  Sie setzt weder Fläche noch Farbe noch Maße — nur den Bezugsrahmen, den ein
  absolut gesetztes Kind braucht. `tests/toastProgress.spec.ts` schlägt an,
  falls Naive den Klassennamen einmal ändert; ohne den Test verschwände der
  Balken bei einem Update still.
-->
<style lang="scss">
.n-notification {
  /* Bezugsrahmen für den Balken. `overflow` hält ihn in den runden Ecken. */
  position: relative;
  overflow: hidden;
}

.ux-toast-progress {
  position: absolute;
  inset: auto 0 0 0;
  height: 2px;

  /*
   * Läuft von links nach rechts voll — dieselbe Leserichtung wie der Text
   * darüber. `transform` statt `width`, weil nur Transformationen ohne
   * Neuberechnung des Layouts laufen: bei einer Meldung nebensächlich, bei
   * fünf gleichzeitig nicht mehr.
   */
  transform-origin: left;
  animation: ux-toast-progress linear forwards;

  /*
   * Kein Ausschluss bei `prefers-reduced-motion`: Der Balken ist keine
   * Zierbewegung, sondern die Anzeige selbst. Abgeschaltet bliebe er leer
   * stehen und zeigte nie an, dass die Zeit läuft.
   */
}

@keyframes ux-toast-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
</style>
