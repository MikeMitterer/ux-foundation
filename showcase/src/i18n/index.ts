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

/**
 * Womit die App startet, wenn weder Wahl noch Browsersprache passen.
 *
 * **Englisch, nicht Deutsch** — und das ist kein Widerspruch dazu, dass `de.ts`
 * der Basiskatalog ist. Die beiden beantworten verschiedene Fragen: Der
 * Basiskatalog sagt, in welcher Sprache geschrieben und woraus übersetzt wird;
 * der Rückfall sagt, was jemand sieht, der **keine** der geführten Sprachen
 * spricht. Für den ist Englisch die bessere Vermutung.
 */
export const FALLBACK_LOCALE: LocaleId = 'en'

export const STORAGE_KEY = 'ux-foundation.showcase.locale'

/** Name des Kanals, über den die Dokumente einander die Wahl mitteilen. */
export const LOCALE_CHANNEL = 'ux-foundation.showcase.locale'

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
 * Der Kanal zwischen den Dokumenten.
 *
 * Jedes iframe baut seine eigene i18n-Instanz auf; der Ref der Elternseite
 * erreicht sie nicht. Ohne diese Brücke wechselte ringsherum alles, während
 * die drei eingebetteten Navigationen in ihrer Startsprache stehenblieben.
 *
 * **Hier stand einmal `storage`** — dasselbe Ereignis, das der Browser
 * auslöst, wenn ein Dokument den Speicher schreibt. Das war falsch, und zwar
 * an einer Stelle, die man nur im Ausfall sieht: Der Speicher ist ausdrücklich
 * optional. `safeStorage` gibt es, weil sein Zugriff in abgeschotteten
 * Browsern **wirft**, und `persistLocale` verschluckt ein Misslingen mit
 * Absicht — die Wahl gilt dann eben nur für diese Sitzung. Genau dann entsteht
 * aber kein `storage`-Ereignis: Die Elternseite wechselt, die iframes bleiben
 * stehen. Eine Anzeige darf nicht davon abhängen, ob eine Bequemlichkeit
 * funktioniert hat.
 *
 * `BroadcastChannel` hängt an nichts davon und ist genauso geschnitten: Er
 * stellt an alle Dokumente derselben Herkunft zu — **außer** an den Absender.
 * Der aktualisiert sich über seinen eigenen Ref, die übrigen hierüber; niemand
 * wird doppelt gesetzt. Nebenbei ziehen zwei Browser-Tabs gleich mit.
 *
 * Der `typeof`-Riegel folgt derselben Haltung wie `safeStorage`: In einem
 * Browser ohne den Kanal fehlt die Kopplung — die Seite läuft trotzdem, statt
 * an einem `ReferenceError` weiß zu bleiben.
 */
const localeChannel =
  typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(LOCALE_CHANNEL)

localeChannel?.addEventListener('message', (event) => {
  const announced: unknown = event.data
  if (typeof announced !== 'string' || !isLocaleId(announced)) return

  i18n.global.locale.value = announced
  document.documentElement.lang = announced
})

/**
 * Sagt den anderen Dokumenten, dass die Sprache gewechselt hat.
 *
 * Getrennt vom Speichern, weil beides Verschiedenes leistet: Der Speicher lässt
 * die Wahl ein Neuladen überleben, der Kanal die schon offenen Dokumente
 * nachziehen. Scheitert das eine, muss das andere weiter tun.
 *
 * @param locale Die neu gewählte Sprache.
 */
export function announceLocale(locale: LocaleId): void {
  localeChannel?.postMessage(locale)
}
