/**
 * Die beiden Kataloge des Schaufensters gegeneinander.
 *
 * Ein zweiter Katalog ist eine zweite Quelle, und die Repo-Regel verlangt im
 * selben Zug den Test dazu. Die **Schlüssel** bewacht schon der Typ `Katalog`
 * in `de.ts` — fehlt einer, ist `make typecheck` rot, nicht erst der Browser.
 * Was der Typ nicht sehen kann, steht hier:
 *
 * 1. **Platzhalter.** `'{count} Kurse fehlen'` und `'quotes missing'` sind für
 *    TypeScript beide `string`. Fällt beim Übersetzen ein `{n}` weg, meldet
 *    niemand etwas — die Zahl fehlt einfach in der Ausgabe.
 * 2. **Klammeraffen.** vue-i18n liest ein `@` als Marker für eine verknüpfte
 *    Nachricht und bricht beim Kompilieren des Katalogs ab. Sichtbar wird das
 *    nur im Browser, nicht im Build; in `de.ts` steht deshalb ein Kommentar
 *    darüber. Ein Kommentar hält niemanden auf, ein Test schon.
 */
import { describe, expect, it } from 'vitest'

import { de } from '../showcase/src/i18n/de'
import { en } from '../showcase/src/i18n/en'

/** Ein Katalog ist zwei Ebenen tief: Gruppe → Schlüssel → Text. */
type Katalog = Record<string, Record<string, string>>

/**
 * Alle Nachrichten eines Katalogs als flache Liste.
 *
 * @param katalog Der Katalog.
 * @returns Paare aus punktiertem Pfad (`patterns.stackBody`) und Text.
 */
function nachrichten(katalog: Katalog): [string, string][] {
  return Object.entries(katalog).flatMap(([gruppe, eintraege]) =>
    Object.entries(eintraege).map(
      ([schluessel, text]): [string, string] => [`${gruppe}.${schluessel}`, text],
    ),
  )
}

/**
 * Die Platzhalter einer Nachricht, sortiert.
 *
 * Sortiert, weil die Reihenfolge im Satz sich beim Übersetzen ändern darf —
 * „die {n}. von {max}" gegen „{max} in total, this is {n}". Was nicht wegfallen
 * darf, ist der Platzhalter selbst.
 *
 * @param text Die Nachricht.
 */
function platzhalter(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((treffer) => treffer[1]).sort()
}

const DEUTSCH = nachrichten(de as unknown as Katalog)
const ENGLISCH = nachrichten(en as unknown as Katalog)

describe('Schaufenster-Kataloge', () => {
  it('führen dieselben Schlüssel', () => {
    // Der Typ prüft das schon — hier steht es, damit ein Fehlschlag den
    // fehlenden Schlüssel *nennt* statt eine Seite später an `undefined` zu
    // scheitern.
    expect(ENGLISCH.map(([pfad]) => pfad).sort()).toEqual(DEUTSCH.map(([pfad]) => pfad).sort())
  })

  it.each(DEUTSCH)('%s trägt in beiden Sprachen dieselben Platzhalter', (pfad, deutsch) => {
    const englisch = ENGLISCH.find(([p]) => p === pfad)?.[1] ?? ''
    expect(platzhalter(englisch)).toEqual(platzhalter(deutsch))
  })

  it.each([...DEUTSCH, ...ENGLISCH])('%s enthält kein @', (_pfad, text) => {
    expect(text).not.toContain('@')
  })

  it('sind nicht leer', () => {
    // Der Typ nimmt auch '' als string. Ein leerer Eintrag ist beim Übersetzen
    // der wahrscheinlichste Platzhalter, den jemand vergisst zu füllen.
    for (const [pfad, text] of [...DEUTSCH, ...ENGLISCH]) {
      expect(text.trim(), pfad).not.toBe('')
    }
  })
})
