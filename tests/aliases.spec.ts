/**
 * `ALIAS_SOURCES` gegen die `paths` in `showcase/tsconfig.json`.
 *
 * Vite und Vitest lesen inzwischen beide aus `aliases.ts` — dort gibt es keine
 * zweite Quelle mehr. Der TypeScript-Compiler kann das nicht: `tsconfig.json`
 * ist JSON und importiert nichts. Dieselbe Lage wie bei den Breakpoints, wo
 * SCSS kein TypeScript lesen kann; und dieselbe Antwort, die die Repo-Regel
 * dafür vorsieht — unvermeidbare Spiegelung, also ein Test, der sie bewacht.
 *
 * Warum das zählt, obwohl beide Seiten heute stimmen: Verschiebt jemand ein
 * Verzeichnis und zieht nur eine Seite nach, sieht `vue-tsc` andere Dateien als
 * Vite. Der Typecheck bliebe grün, weil er für sich gültige Pfade auflöst, und
 * der Bau ebenso — die beiden prüften nur nicht mehr dasselbe Projekt.
 *
 * `process.cwd()` statt `import.meta.url`: Unter happy-dom ist die Modul-
 * Adresse keine Datei-URL, der Zugriff wirft.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { ALIAS_SOURCES } from '../aliases'

const ROOT = process.cwd()
const TSCONFIG = resolve(ROOT, 'showcase/tsconfig.json')

interface Tsconfig {
  compilerOptions: {
    baseUrl: string
    paths: Record<string, string[]>
  }
}

const tsconfig = JSON.parse(readFileSync(TSCONFIG, 'utf-8')) as Tsconfig

/**
 * Löst einen `paths`-Eintrag zu einem absoluten Verzeichnis auf.
 *
 * Die Muster tragen ein `/*` am Ende — für den Vergleich mit einem Alias zählt
 * das Verzeichnis davor. Gerechnet wird von `baseUrl` aus, und die wiederum
 * liegt relativ zur `tsconfig.json` selbst.
 *
 * @param pattern Der Wert aus `paths`, etwa `./src/*`.
 */
function resolveFromTsconfig(pattern: string): string {
  return resolve(dirname(TSCONFIG), tsconfig.compilerOptions.baseUrl, pattern.replace(/\/\*$/, ''))
}

describe('Alias-Zuordnungen', () => {
  it('führt in der tsconfig genau die Aliase, die auch Vite und Vitest kennen', () => {
    const fromTsconfig = Object.keys(tsconfig.compilerOptions.paths)
      .map((key) => key.replace(/\/\*$/, ''))
      .sort()

    expect(fromTsconfig).toEqual(Object.keys(ALIAS_SOURCES).sort())
  })

  it.each(Object.entries(ALIAS_SOURCES))(
    '%s zeigt in der tsconfig auf dasselbe Verzeichnis',
    (name, source) => {
      const patterns = tsconfig.compilerOptions.paths[`${name}/*`]

      // Mehrere Ziele je Alias wären mit einem einzigen Vite-Alias nicht
      // abzubilden — dann stimmten die Seiten schon im Ansatz nicht.
      expect(patterns, `${name} hat kein oder mehr als ein Ziel`).toHaveLength(1)
      expect(resolveFromTsconfig(patterns[0])).toBe(resolve(ROOT, source))
    },
  )
})
