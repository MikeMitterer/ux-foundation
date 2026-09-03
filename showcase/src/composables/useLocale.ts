/**
 * Aktive Sprache der Schaufenster-App.
 *
 * Dasselbe Muster wie `useTheme`: Der Zustand liegt hier, Komponenten stellen
 * nur dar. Gehalten wird er nicht doppelt — die Quelle ist die Locale der
 * i18n-Instanz; ein zweiter Ref daneben wäre eine zweite Wahrheit, und eine
 * davon liefe irgendwann nach.
 *
 * Was **nicht** hier liegt: `lang` am Wurzelelement und das Nachziehen einer
 * Wahl aus einem anderen Dokument. Beides gehört zu jedem Dokument, auch zu
 * denen ohne Umschalter — die eingebetteten Mobil-Ansichten zeigen keinen —,
 * und steht deshalb in `i18n/index.ts`, das jedes von ihnen lädt.
 */
import { readonly, type Ref } from 'vue'

import { persistLocale } from '@ux/index'
import { announceLocale, i18n, STORAGE_KEY, type LocaleId } from '@/i18n'

const current = i18n.global.locale

export function useLocale(): {
  current: Readonly<Ref<LocaleId>>
  setLocale: (locale: LocaleId) => void
} {
  return {
    current: readonly(current),
    setLocale: (locale: LocaleId): void => {
      current.value = locale
      // Zwei getrennte Aufgaben: `persistLocale` lässt die Wahl ein Neuladen
      // überleben (und zieht `lang` mit), `announceLocale` holt die schon
      // offenen Dokumente nach. Der Speicher darf ausfallen, ohne dass die
      // eingebetteten Ansichten in der alten Sprache stehenbleiben.
      persistLocale(locale, STORAGE_KEY)
      announceLocale(locale)
    },
  }
}
