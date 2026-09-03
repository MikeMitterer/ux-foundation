/**
 * i18n-Einrichtung der Schaufenster-App.
 *
 * Zwei Sprachen, und das ist hier kein Zierrat: Was am Sprachwechsel hängt —
 * eine Meldung, die ihre Überschrift nachzieht, eine Zahl, die ihr Format
 * wechselt, ein Reiterbalken, der neu gerechnet werden muss — lässt sich nur
 * vorführen, wenn es etwas zum Wechseln gibt.
 */
import { createI18n } from 'vue-i18n'

import { detectLocale } from '@ux/index'

import { de, type MessageSchema } from './de'
import { en } from './en'

export const LOCALE_IDS = ['de', 'en'] as const
export type LocaleId = (typeof LOCALE_IDS)[number]

const FALLBACK_LOCALE: LocaleId = 'de'
export const STORAGE_KEY = 'ux-foundation.showcase.locale'

/*
 * Die Erkennung kommt aus dem Paket, das dieses Schaufenster vorführt — hier
 * eine eigene zu schreiben wäre die peinlichste Stelle für eine Kopie. Die
 * Reihenfolge steckt darin: gespeicherte Wahl → Browsersprache → Rückfall.
 */
/*
 * Das dritte Typargument (`Legacy = false`) ist nicht schmückend: Ohne es
 * verbreitert TypeScript das `legacy: false` unten zu `boolean`, fällt auf die
 * Vorgabe `true` zurück und tippt `i18n.global` als Legacy-Instanz — dort ist
 * `locale` eine schlichte Zeichenkette statt eines Refs, und `useLocale`
 * bekäme etwas, das zur Laufzeit gar nicht da ist.
 */
export const i18n = createI18n<[MessageSchema], LocaleId, false>({
  legacy: false,
  locale: detectLocale(LOCALE_IDS, FALLBACK_LOCALE, STORAGE_KEY),
  fallbackLocale: FALLBACK_LOCALE,
  messages: { de, en },
})
