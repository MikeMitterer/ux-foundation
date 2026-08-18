/**
 * Wächter: Überschriften tragen ihre Stufe aus dem Paket.
 *
 * Der Reset setzte `h1`–`h4` einmal auf `font-size: inherit` — Tailwinds
 * Preflight-Verhalten. Als Reset ist das richtig, als Fundament falsch: Ein
 * `<h3>` sah damit aus wie Fließtext, und **jede** App baute die Stufen neu.
 * Genau diese Wiederholung soll das Paket abschaffen, und genau dorthin
 * zurückzurutschen ist die naheliegende Regression — `inherit` sieht in einem
 * Reset ja plausibel aus.
 *
 * Geprüft wird die Datei, nicht das Bild: Ob 18 px in einem Browser gut
 * aussehen, entscheidet niemand hier. Ob die Stufe überhaupt gesetzt wird,
 * schon.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/*
 * Über das Arbeitsverzeichnis und nicht über `import.meta.url`: Die Tests
 * laufen unter `happy-dom`, dort ist `import.meta.url` keine Datei-URL.
 */
const resetCss = readFileSync(resolve(process.cwd(), 'src/styles/reset.css'), 'utf8')
const ohneKommentare = resetCss.replace(/\/\*[\s\S]*?\*\//g, '')

const EBENEN = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

/** Alle Regelblöcke als (Selektorliste, Inhalt). */
const bloecke = [...ohneKommentare.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({
  selektoren: (m[1] ?? '').split(',').map((s) => s.trim()),
  inhalt: m[2] ?? '',
}))

/**
 * Die Blöcke, die `tag` mitsetzen — als einzelner Selektor oder in einer Liste.
 *
 * Nach Selektorliste getrennt und nicht per Textsuche: Ein Ausdruck wie
 * `/h4\s*\{/` trifft auch die letzte Zeile einer Sammelregel, weil `h4 {` dort
 * ebenfalls am Zeilenanfang steht. Der Test las dann den falschen Block.
 */
function bloeckeFuer(tag: string): string[] {
  return bloecke.filter((b) => b.selektoren.includes(tag)).map((b) => b.inhalt)
}

/** Der Block, der alle Ebenen gemeinsam setzt — dort stehen Familie und Farbe. */
const gemeinsam =
  bloecke.find((b) => EBENEN.every((tag) => b.selektoren.includes(tag)))?.inhalt ?? ''

describe('Überschriften im Reset', () => {
  it('setzt Familie, Gewicht und Farbe für jede Ebene, h1 bis h6', () => {
    expect(gemeinsam, `kein Block, der ${EBENEN.join(', ')} gemeinsam setzt`).not.toBe('')

    for (const eigenschaft of ['font-family', 'font-weight', 'color']) {
      expect(gemeinsam, `${eigenschaft} fehlt im gemeinsamen Block`).toMatch(
        new RegExp(`(?<![\\w-])${eigenschaft}\\s*:`),
      )
    }
  })

  it('gibt keiner Ebene die Größe des Fließtexts zurück', () => {
    /*
     * Der eigentliche Rückfall: `font-size: inherit` macht jede Überschrift
     * wieder zu Fließtext. Wer das einbaut, meint es gut — es ist die
     * Preflight-Zeile, die hier einmal stand.
     */
    expect(gemeinsam).not.toMatch(/font-size\s*:\s*inherit/)
    expect(gemeinsam).not.toMatch(/font-weight\s*:\s*inherit/)
  })

  it('gibt jeder Ebene eine Größe aus der Skala', () => {
    const grade = EBENEN.map((tag) => {
      const treffer = bloeckeFuer(tag)
        .map((inhalt) => /font-size\s*:\s*var\((--font-[\w-]+)\)/.exec(inhalt)?.[1])
        .filter(Boolean)

      expect(treffer.length, `${tag} nimmt seine Größe nicht aus der Skala`).toBeGreaterThan(0)
      return treffer[0] as string
    })

    /*
     * Vier Grade, nicht sechs: `h4` bis `h6` teilen sich den kleinsten. Wer so
     * tief gliedert, hat eine Struktur zu tief — das soll man an der Struktur
     * merken und nicht daran, dass die Schrift noch kleiner wird.
     */
    expect(new Set(grade).size, `Abstufungen: ${grade.join(', ')}`).toBe(4)

    // Der Seitentitel muss über der Abschnittsüberschrift stehen, sonst ist
    // die Seite eine Aufzählung statt einer Gliederung.
    expect(grade[0], 'h1 und h2 haben denselben Grad').not.toBe(grade[1])
  })

  it('gibt der Überschrift keinen eigenen Rand', () => {
    /*
     * Klingt nach einer Kleinigkeit und ist die Regel des Hauses: Weiter oben
     * setzt `* { margin: 0 }` alles auf null, weil der **Container** die
     * Abstände macht — per `gap` oder Polster. Ein Rand an der Überschrift
     * addiert sich dazu, statt ihn zu ersetzen: In einer Naive-Karte ergaben
     * 20 px Polster plus 12 px Rand 32 px, wo 20 gewollt waren.
     */
    expect(gemeinsam, 'Abstände macht der Container, nicht die Überschrift').not.toMatch(
      /(?<![\w-])margin/,
    )
  })
})
