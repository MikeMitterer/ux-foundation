/**
 * Niemand greift direkt auf den `localStorage` zu — außer `safeStorage` selbst.
 *
 * Der Grund steckt in einer Zeile, die man leicht überliest: Im privaten Modus
 * mancher Browser und bei blockierten Cookies wirft schon der **Zugriff** auf
 * `window.localStorage`, nicht erst `getItem`. Ein ungeschützter Aufruf reißt
 * damit das Laden einer ganzen Ansicht mit.
 *
 * Warum das ein Test ist und keine Regel: Die Regel gab es. Sie stand im Skill,
 * und `useTheme.ts` hielt sie trotzdem nicht ein — nicht aus Nachlässigkeit,
 * sondern weil die Datei eine Stunde **älter** war als `safeStorage` und danach
 * nie wieder angefasst wurde. Eine Regel greift nur, wenn jemand die Datei
 * öffnet; ein Test greift immer.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/* `process.cwd()` statt `import.meta.url` — unter happy-dom ist die
   Modul-Adresse keine Datei-URL und der Zugriff wirft. */
const ROOT = process.cwd()

const TREES = ['src', 'showcase/src']

/** Die einzige Datei, die zugreifen darf — sie *ist* die Absicherung. */
const ALLOWED = 'src/composables/safeStorage.ts'

/**
 * Alle Quelldateien eines Verzeichnisbaums.
 *
 * @param dir Verzeichnis, ab dem gesucht wird.
 */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return ['.ts', '.vue'].includes(extname(path)) ? [path] : []
  })
}

/**
 * Entfernt Kommentare, damit der Test auf Code anspricht und nicht auf Prosa.
 *
 * Ohne das wäre er sofort wieder abgeschaltet: In `localeDetection.ts` steht
 * `localStorage` dreimal in der Dokumentation, in `i18n/index.ts` zweimal in
 * einer Begründung — alles richtig, alles kein Zugriff.
 *
 * Der Sonderfall beim Zeilenkommentar ist `https://…`: Ein `//` mit
 * Doppelpunkt davor gehört zu einer Adresse und leitet keinen Kommentar ein.
 *
 * **Die Zeilenzahl bleibt erhalten.** Ein mehrzeiliger Kommentar wird durch
 * ebenso viele Umbrüche ersetzt, nicht durch ein Leerzeichen. Sonst meldet der
 * Test eine Zeile 17, während der Verstoß in Zeile 32 steht — und der ganze
 * Nutzen des Wächters ist, die Stelle zu **nennen**.
 *
 * @param source Inhalt der Datei.
 */
function stripComments(source: string): string {
  const blank = (match: string): string => '\n'.repeat((match.match(/\n/g) ?? []).length)

  return source
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

/**
 * Die Zeilen einer Datei, die tatsächlich auf den Speicher zugreifen.
 *
 * Gesucht wird **jede Erwähnung im Code**, nicht nur `localStorage.getItem`.
 * Das ist der Kern der Sache: In abgeschotteten Browsern wirft schon der bloße
 * Zugriff auf die Referenz. `safeStorage` selbst tut genau das — ein nacktes
 * `window.localStorage ?? null` in einem `try` — und ein Wächter, der nur
 * Eigenschaftszugriffe sucht, sähe weder das noch ein `window.localStorage?.`
 * mit Optional Chaining.
 *
 * Beides ist mir hier zunächst passiert. Der zweite Test unten hat es
 * aufgedeckt, und genau dafür steht er da.
 *
 * `\b` statt eines eigenen Riegels: Es trifft `localStorage`, aber nicht
 * `safeStorage`.
 *
 * @param path Pfad der Datei.
 */
function storageAccesses(path: string): string[] {
  const lines = stripComments(readFileSync(path, 'utf-8')).split('\n')

  return lines
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => /\blocalStorage\b/.test(line))
    .map(({ line, number }) => `${relative(ROOT, path)}:${number} → ${line}`)
}

describe('Zugriff auf den Speicher', () => {
  const offenders = TREES.flatMap((tree) => sourceFiles(join(ROOT, tree)))
    .filter((path) => relative(ROOT, path) !== ALLOWED)
    .flatMap(storageAccesses)

  it('läuft ausschließlich über `safeStorage`', () => {
    // Die Fundstellen stehen mit Datei und Zeile in der Meldung — sonst sucht
    // man sie in zwei Bäumen von Hand.
    expect(offenders, `direkter Zugriff:\n${offenders.join('\n')}`).toEqual([])
  })

  it('sieht die Ausnahme wirklich an, statt sie nur zu behaupten', () => {
    // Gegenprobe zum Filter oben: Wäre `safeStorage.ts` umbenannt oder leer,
    // liefe der Test grün, ohne je etwas geprüft zu haben.
    expect(storageAccesses(join(ROOT, ALLOWED)).length).toBeGreaterThan(0)
  })
})
