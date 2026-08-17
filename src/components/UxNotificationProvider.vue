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
