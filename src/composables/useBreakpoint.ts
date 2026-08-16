/**
 * Die Umschaltpunkte — dieselben Grenzen wie in `_shared.scss`, nur zur
 * Laufzeit lesbar.
 *
 * Es gibt Entscheidungen, die eine Media-Query nicht treffen kann: ob eine
 * Tabelle oder eine Kartenliste **gerendert** wird, ist keine Frage der
 * Darstellung, sondern des Markups. Dafür braucht es die Grenze als Zahl.
 *
 * Dass sie damit zweimal im Paket steht — hier und als `$bp-*` im SCSS — ist
 * unvermeidlich; SCSS kann kein TypeScript lesen. Ein Test im Paket vergleicht
 * beide Quellen und schlägt an, sobald eine allein verschoben wird.
 */
import { onMounted, onUnmounted, readonly, ref, type Ref } from 'vue'

/**
 * Die vier verbindlichen Stufen, in Pixel. Gilt über alle Apps — siehe
 * `ux-standards`.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export type BreakpointName = keyof typeof BREAKPOINTS

/**
 * Unterhalb dieser Breite gilt die Leseansicht: eine Spalte, Karten statt
 * Tabelle.
 *
 * Das ist die einzige Grenze, an der sich der Aufbau ändert — die anderen drei
 * verschieben nur Abstände und Sichtbarkeiten und bleiben deshalb im SCSS.
 */
export const COMPACT_BREAKPOINT_PX = BREAKPOINTS.md

/**
 * Liefert `true`, solange das Fenster schmaler als der Umschaltpunkt ist.
 *
 * Reagiert auf Größenänderungen und auf das Drehen des Geräts. Zentral statt
 * in jeder Komponente: So kippen Ansicht und Layout-Klassen gemeinsam.
 */
export function useIsCompact(): Readonly<Ref<boolean>> {
  const isCompact = ref<boolean>(false)

  let query: MediaQueryList | null = null

  function update(event: MediaQueryList | MediaQueryListEvent): void {
    isCompact.value = event.matches
  }

  onMounted(() => {
    /*
     * `- 0.02` statt `- 1`: Bei Zoom und auf Geräten mit gebrochenem
     * Pixelverhältnis kommen Breiten wie 767.5 vor. Mit `max-width: 767px`
     * fiele so ein Fenster durch beide Raster — es wäre weder schmal noch
     * breit, und die Ansicht kippte an einer anderen Stelle als das Layout.
     */
    query = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT_PX - 0.02}px)`)
    update(query)
    query.addEventListener('change', update)
  })

  onUnmounted(() => {
    query?.removeEventListener('change', update)
  })

  return readonly(isCompact)
}
