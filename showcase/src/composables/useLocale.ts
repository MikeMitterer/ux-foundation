/**
 * Aktive Sprache der Schaufenster-App.
 *
 * Dasselbe Muster wie `useTheme`: Der Zustand samt Seiteneffekt liegt hier,
 * Komponenten stellen nur dar. Gehalten wird er nicht doppelt — die Quelle ist
 * die Locale der i18n-Instanz; ein zweiter Ref daneben wäre eine zweite
 * Wahrheit, und eine davon liefe irgendwann nach.
 */
import { readonly, type Ref } from 'vue'

import { persistLocale } from '@ux/index'
import { i18n, STORAGE_KEY, type LocaleId } from '@/i18n'

const current = i18n.global.locale

/*
 * Beim Start wird `lang` gesetzt, aber **nichts gespeichert**.
 *
 * `persistLocale` täte beides, und das wäre hier falsch: Der bloße Besuch
 * schriebe die erkannte Browsersprache als „Wahl" fest, und ab dem zweiten
 * Aufruf käme die Stufe „Browsersprache" nie mehr zum Zug — wer seinen Browser
 * später umstellt, bekäme weiter die alte. Gespeichert wird erst, wenn jemand
 * den Umschalter anfasst.
 */
document.documentElement.lang = current.value

export function useLocale(): {
  current: Readonly<Ref<LocaleId>>
  setLocale: (locale: LocaleId) => void
} {
  return {
    current: readonly(current),
    setLocale: (locale: LocaleId): void => {
      current.value = locale
      persistLocale(locale, STORAGE_KEY)
    },
  }
}
