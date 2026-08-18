/**
 * Kontrast-Wächter: misst jede Palette gegen die Grenzwerte — bei jedem Lauf.
 *
 * Vorher steckte diese Prüfung allein in `make check-themes` und lief damit
 * nur, wenn jemand daran dachte. Ein Wächter auf Zuruf ist keiner: Die
 * Verstöße, die T-14 zutage förderte, standen monatelang in der Datei.
 *
 * **Gerechnet wird nicht hier.** Die Formel, die Regeln und die gerenderten
 * Leisten-Flächen leben in `scripts/theme-tokens.py`; dieser Test ruft es auf
 * und liest den Exit-Code. Eine zweite Kontrastrechnung in TypeScript wäre
 * genau die Doppelquelle, die das Repo sonst überall vermeidet — und sie würde
 * beim nächsten neuen Grenzwert stillschweigend etwas anderes messen.
 */
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { THEME_IDS } from '@ux/index'

/*
 * Über das Arbeitsverzeichnis und nicht über `import.meta.url`: Die Tests
 * laufen unter `happy-dom`, dort ist `import.meta.url` keine Datei-URL.
 */
const SKRIPT = resolve(process.cwd(), 'scripts/theme-tokens.py')
const TOKENS = resolve(process.cwd(), 'src/styles/tokens.css')

interface Lauf {
  code: number
  ausgabe: string
}

/**
 * Führt `theme-tokens.py check` aus und liefert Exit-Code samt Ausgabe.
 *
 * Ein fehlendes `python3` wird **nicht** zu einem übersprungenen Test: Ein
 * Wächter, der sich bei fehlendem Werkzeug still selbst abschaltet, meldet
 * grün für eine Prüfung, die nie stattgefunden hat.
 */
function pruefe(): Lauf {
  try {
    const ausgabe = execFileSync('python3', [SKRIPT, 'check', TOKENS], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { code: 0, ausgabe }
  } catch (fehler) {
    const e = fehler as { code?: string; status?: number; stdout?: string; stderr?: string }
    if (e.code === 'ENOENT') {
      throw new Error(
        'python3 nicht gefunden — der Kontrast-Wächter kann nicht messen. ' +
          'Python installieren, nicht den Test überspringen.',
      )
    }
    return { code: e.status ?? 1, ausgabe: `${e.stdout ?? ''}${e.stderr ?? ''}` }
  }
}

const lauf = pruefe()

/**
 * Die Themes, die das Skript tatsächlich gemessen hat.
 *
 * Gelesen aus den Kopfzeilen seiner Ausgabe — je Theme eine Zeile mit zwei
 * Leerzeichen Einzug, dem Namen und dem Urteil. Die Befundzeilen darunter
 * tragen sechs Leerzeichen und fallen damit nicht ins Raster.
 *
 * Ein Mengenvergleich, kein Teilstring-Test: `ausgabe.includes('petrol')`
 * wäre auch bei einem verunglückten `petrol-verschluckt` erfüllt — genau
 * daran ist der erste Entwurf dieses Wächters durchgerutscht.
 */
function gemessen(): string[] {
  return [...lauf.ausgabe.matchAll(/^ {2}([a-z][\w-]*) {2,}\S/gm)].map((m) => m[1] ?? '')
}

describe('Kontrast der Paletten', () => {
  it('hält in jedem Theme alle harten Grenzwerte', () => {
    expect(lauf.code, `theme-tokens.py check meldet Verstöße:\n\n${lauf.ausgabe}`).toBe(0)
  })

  it('misst dabei jedes Theme — nicht nur die, die der Parser findet', () => {
    /*
     * Der zweite Test ist der wichtigere. Exit-Code 0 heißt „nichts gerissen",
     * nicht „alles geprüft": Ein Ausdruck im Skript las gruppierte Selektoren
     * einmal nur zur Hälfte, `paper` fiel dabei aus der Messung — und der Lauf
     * blieb grün. Ohne diese Zeile wäre das wieder unsichtbar.
     */
    const gepruefte = gemessen()

    expect(gepruefte.length, `Ausgabe unlesbar geworden:\n\n${lauf.ausgabe}`).toBeGreaterThan(0)
    expect([...gepruefte].sort(), `gemessen wurde:\n\n${lauf.ausgabe}`).toEqual(
      [...THEME_IDS].sort(),
    )
  })
})
