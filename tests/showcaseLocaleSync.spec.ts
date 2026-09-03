/**
 * Ein Dokument folgt einer Sprachwahl, die in einem anderen getroffen wurde.
 *
 * Der Mobil-Abschnitt bettet dieselbe App dreimal als iframe ein. Jedes dieser
 * Dokumente baut seine **eigene** i18n-Instanz auf — der Ref der Elternseite
 * erreicht sie nicht. Ohne die Brücke über den `storage`-Ereignis blieben die
 * drei Navigationen in der Sprache stehen, mit der sie geladen wurden, während
 * ringsherum alles wechselt.
 *
 * Genau das ist der Fall, den kein Katalog-Test findet: Die Kataloge sind in
 * Ordnung, die Synchronisation über Dokumentgrenzen fehlt.
 */
import { beforeEach, describe, expect, it } from 'vitest'

import { i18n, STORAGE_KEY } from '../showcase/src/i18n'

/**
 * Feuert das Ereignis, das der Browser in **anderen** Dokumenten derselben
 * Herkunft auslöst, wenn eines von ihnen den Speicher schreibt.
 *
 * @param key      Der geschriebene Schlüssel.
 * @param newValue Der neue Wert; `null` heißt gelöscht.
 */
function fireStorageEvent(key: string | null, newValue: string | null): void {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }))
}

describe('Sprache über Dokumentgrenzen', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'de'
    document.documentElement.lang = 'de'
  })

  it('übernimmt eine Wahl aus einem anderen Dokument', () => {
    fireStorageEvent(STORAGE_KEY, 'en')

    expect(i18n.global.locale.value).toBe('en')
  })

  it('zieht `lang` am Wurzelelement mit', () => {
    // Ohne das trennt der Browser im iframe die Wörter nach den Regeln der
    // falschen Sprache, und Vorleseprogramme sprechen sie falsch aus.
    fireStorageEvent(STORAGE_KEY, 'en')

    expect(document.documentElement.lang).toBe('en')
  })

  it('lässt fremde Schlüssel in Ruhe', () => {
    // Im selben Speicher liegt auch das Theme. Ein Umschalten dort darf die
    // Sprache nicht anfassen.
    fireStorageEvent('ux-foundation.theme', 'ocean')

    expect(i18n.global.locale.value).toBe('de')
  })

  it('ignoriert eine Sprache, für die es keinen Katalog gibt', () => {
    // Der Speicher ist von außen beschreibbar — die Konsole des Browsers
    // genügt. Ein unbekannter Wert darf die Oberfläche nicht leerräumen.
    fireStorageEvent(STORAGE_KEY, 'fr')

    expect(i18n.global.locale.value).toBe('de')
  })

  it('ignoriert das Leeren des Speichers', () => {
    // `localStorage.clear()` meldet `newValue: null`. Das ist keine Wahl.
    fireStorageEvent(STORAGE_KEY, null)

    expect(i18n.global.locale.value).toBe('de')
  })
})
