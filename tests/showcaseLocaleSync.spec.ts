/**
 * Ein Dokument folgt einer Sprachwahl, die in einem anderen getroffen wurde.
 *
 * Der Mobil-Abschnitt bettet dieselbe App dreimal als iframe ein. Jedes dieser
 * Dokumente baut seine **eigene** i18n-Instanz auf — der Ref der Elternseite
 * erreicht sie nicht. Ohne Brücke blieben die drei Navigationen in der Sprache
 * stehen, mit der sie geladen wurden, während ringsherum alles wechselt.
 *
 * **Warum `BroadcastChannel` und nicht das `storage`-Ereignis:** Die erste
 * Fassung hing am Speicher. Der ist aber ausdrücklich optional — `safeStorage`
 * gibt es, weil der Zugriff in abgeschotteten Browsern wirft, und
 * `persistLocale` verschluckt ein Misslingen absichtlich. Genau dann entstand
 * kein `storage`-Ereignis, und die Synchronisation fiel still aus: Die
 * Elternseite wechselte, die iframes nicht. Eine Anzeige, die von der
 * Bequemlichkeitsspeicherung abhängt, ist keine Anzeige.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { detectLocale } from '@ux/index'

import {
  FALLBACK_LOCALE,
  LOCALE_CHANNEL,
  LOCALE_IDS,
  announceLocale,
  i18n,
} from '../showcase/src/i18n'

/**
 * Spielt ein **anderes** Dokument, das die Sprache umgestellt hat.
 *
 * Ein eigener Kanal derselben Herkunft ist genau das: Der Absender bekommt
 * seine eigene Nachricht nicht, der Empfänger im Modul schon.
 *
 * @param message Was gesendet wird — normalerweise eine Sprachkennung.
 */
function announceFromOtherDocument(message: unknown): void {
  const channel = new BroadcastChannel(LOCALE_CHANNEL)
  channel.postMessage(message)
  channel.close()
}

/**
 * Wartet, bis eine Bedingung gilt — höchstens bis zur Frist.
 *
 * **Nicht** eine feste Anzahl Ticks: Die Zustellung im Kanal ist asynchron, und
 * die *erste* im Lauf braucht spürbar länger als die folgenden. Ein fester
 * Tick reichte für alle Fälle außer dem ersten, und der Test war genau einmal
 * rot — beim Kaltstart. Eine Wartezeit, die nur meistens reicht, ist ein Test,
 * der nur meistens etwas aussagt.
 *
 * @param condition Was gelten soll.
 * @param timeoutMs Frist in Millisekunden.
 */
async function waitUntil(condition: () => boolean, timeoutMs = 500): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (!condition() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

/**
 * Lässt alles zustellen, was unterwegs ist.
 *
 * Für die Fälle, in denen **nichts** passieren darf: Dort gibt es keine
 * Bedingung, auf die man warten könnte — man muss der Nachricht Zeit geben,
 * anzukommen, und danach feststellen, dass sie nichts geändert hat.
 */
async function settle(): Promise<void> {
  for (let i = 0; i < 10; i++) await new Promise((resolve) => setTimeout(resolve, 5))
}

describe('Sprache über Dokumentgrenzen', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'de'
    document.documentElement.lang = 'de'
  })

  it('übernimmt eine Wahl aus einem anderen Dokument', async () => {
    announceFromOtherDocument('en')
    await waitUntil(() => i18n.global.locale.value === 'en')

    expect(i18n.global.locale.value).toBe('en')
  })

  it('zieht `lang` am Wurzelelement mit', async () => {
    // Ohne das trennt der Browser im iframe die Wörter nach den Regeln der
    // falschen Sprache, und Vorleseprogramme sprechen sie falsch aus.
    announceFromOtherDocument('en')
    await waitUntil(() => document.documentElement.lang === 'en')

    expect(document.documentElement.lang).toBe('en')
  })

  it('kommt ohne den Speicher aus', async () => {
    // Der eigentliche Grund für den Kanal: Fällt der Speicher aus, wechselt die
    // Elternseite trotzdem — und die iframes müssen mitkommen.
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Speicher nicht verfügbar')
    })

    announceFromOtherDocument('en')
    await waitUntil(() => i18n.global.locale.value === 'en')

    expect(i18n.global.locale.value).toBe('en')
    write.mockRestore()
  })

  it('ignoriert eine Sprache, für die es keinen Katalog gibt', async () => {
    // Der Kanal ist von jedem Dokument derselben Herkunft beschreibbar. Ein
    // unbekannter Wert darf die Oberfläche nicht leerräumen.
    announceFromOtherDocument('fr')
    await settle()

    expect(i18n.global.locale.value).toBe('de')
  })

  it('ignoriert Nachrichten, die keine Sprachkennung sind', async () => {
    announceFromOtherDocument({ irgendwas: true })
    await settle()

    expect(i18n.global.locale.value).toBe('de')
  })

  it('sagt eine eigene Wahl den anderen Dokumenten an', async () => {
    // Die Gegenrichtung: Bisher prüfte alles nur das Empfangen. Sendet niemand,
    // ist der beste Empfänger nutzlos — und der Absender bekommt seine eigene
    // Nachricht nicht, kann sie also auch nicht selbst bemerken.
    const received: unknown[] = []
    const listener = new BroadcastChannel(LOCALE_CHANNEL)
    listener.addEventListener('message', (event) => received.push(event.data))

    announceLocale('en')
    await waitUntil(() => received.length > 0)
    listener.close()

    expect(received).toEqual(['en'])
  })
})

describe('Rückfall-Sprache des Schaufensters', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ist Englisch, sobald es einen englischen Katalog gibt', () => {
    // Deutsch ist die Sprache des **Basiskatalogs**, nicht der Rückfall zur
    // Laufzeit: Wer weder Deutsch noch Englisch spricht, kommt mit Englisch
    // weiter als mit Deutsch.
    vi.stubGlobal('navigator', { languages: ['fr-FR', 'fr'] })

    expect(detectLocale(LOCALE_IDS, FALLBACK_LOCALE, 'ux-foundation.test.locale')).toBe('en')
  })

  it('nimmt trotzdem Deutsch, wenn der Browser es führt', () => {
    vi.stubGlobal('navigator', { languages: ['de-AT', 'de'] })

    expect(detectLocale(LOCALE_IDS, FALLBACK_LOCALE, 'ux-foundation.test.locale')).toBe('de')
  })
})
