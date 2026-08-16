/**
 * Alter eines Zeitstempels — als Zahl, nicht als Satz.
 *
 * Bewusst **ohne** Formulierung: „vor 3 Min" ist sichtbarer Text und gehört
 * damit in den Katalog der App, nicht in ein Paket. Das Fundament liefert die
 * Minuten, die App macht daraus einen Satz in ihrer Sprache.
 */
import { computed, ref, onMounted, onUnmounted, type ComputedRef, type Ref } from 'vue'

/** Minuten seit dem Zeitstempel; `null` wenn keiner vorliegt oder er unlesbar ist. */
export function minutesSince(isoTimestamp: string | null, now: number = Date.now()): number | null {
  if (!isoTimestamp) return null
  const then = Date.parse(isoTimestamp)
  if (Number.isNaN(then)) return null
  return Math.max(0, Math.floor((now - then) / 60_000))
}

/**
 * Reaktive Minuten seit dem Zeitstempel, minütlich nachgeführt.
 *
 * Der Zähler läuft mit, weil sonst „vor 2 Min" stehen bliebe, bis irgendetwas
 * anderes ein Neuzeichnen auslöst — und das kann Stunden dauern.
 *
 * @param isoTimestamp Zeitstempel als ISO-Zeichenkette oder `null`.
 */
export function useMinutesSince(isoTimestamp: Ref<string | null>): ComputedRef<number | null> {
  const now = ref(Date.now())
  let ticker: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    ticker = setInterval(() => {
      now.value = Date.now()
    }, 60_000)
  })

  onUnmounted(() => {
    if (ticker !== null) clearInterval(ticker)
  })

  return computed(() => minutesSince(isoTimestamp.value, now.value))
}
