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

/**
 * Ist das eine Sprache, für die es einen Katalog gibt?
 *
 * Gebraucht am Rand: Der Speicher ist von außen beschreibbar — die Konsole des
 * Browsers genügt —, und eine Sprache ohne Katalog räumte die Oberfläche leer.
 *
 * @param value Der zu prüfende Wert.
 */
function isLocaleId(value: string | null): value is LocaleId {
  return value !== null && (LOCALE_IDS as readonly string[]).includes(value)
}

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

/*
 * `lang` am Wurzelelement — je Dokument, hier und nicht im Composable.
 *
 * Der Mobil-Abschnitt bettet dieselbe App dreimal als iframe ein. Diese Datei
 * lädt jedes dieser Dokumente über `main.ts`; das Composable dagegen kennt nur,
 * wer einen Umschalter zeigt — die iframes tun das nicht und blieben ohne
 * `lang` stehen.
 *
 * Ohne Speichern: Der bloße Besuch darf die erkannte Browsersprache nicht als
 * „Wahl" festschreiben, sonst käme die Stufe „Browsersprache" nie wieder zum
 * Zug. Geschrieben wird erst, wenn jemand den Umschalter anfasst.
 */
document.documentElement.lang = i18n.global.locale.value

/*
 * Ein Dokument folgt einer Wahl, die in einem **anderen** getroffen wurde.
 *
 * Jedes iframe baut seine eigene i18n-Instanz auf; der Ref der Elternseite
 * erreicht sie nicht. Ohne diese Brücke wechselte ringsherum alles, während
 * die drei eingebetteten Navigationen in ihrer Startsprache stehenblieben.
 *
 * `storage` ist der passende Kanal, weil er genau so geschnitten ist, wie es
 * hier gebraucht wird: Er feuert in allen Dokumenten derselben Herkunft —
 * **außer** in dem, das geschrieben hat. Das schreibende aktualisiert sich über
 * seinen eigenen Ref, die übrigen hierüber; niemand wird doppelt gesetzt.
 * Nebenbei ziehen damit auch zwei Browser-Tabs des Schaufensters gleich.
 */
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY || !isLocaleId(event.newValue)) return

  i18n.global.locale.value = event.newValue
  document.documentElement.lang = event.newValue
})
