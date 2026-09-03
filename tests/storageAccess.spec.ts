/**
 * Niemand greift direkt auf den `localStorage` zu — außer `safeStorage` selbst.
 *
 * Die Regel steht im Skill `ux-standards`, Abschnitt „Speicher". Hier steht,
 * wie sie geprüft wird.
 *
 * Geprüft wird über den **TypeScript-Parser**, nicht über Textsuche: Nur er
 * unterscheidet Bezeichner von Zeichenkette, Template-Literal, Regex-Literal
 * und Kommentar. Gesucht wird der Bezeichner `localStorage` im Syntaxbaum, was
 * `window.localStorage`, `localStorage?.getItem`, `localStorage['x']` und
 * `const { localStorage } = window` ohne Aufzählung gleichermaßen erfasst.
 *
 * Die zweite Beschreibung unten hält die beiden Fälle fest, an denen eine
 * Fassung über Text nachweislich scheiterte.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { parse as parseSfc } from '@vue/compiler-sfc'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/* `process.cwd()` statt `import.meta.url` — unter happy-dom ist die
   Modul-Adresse keine Datei-URL und der Zugriff wirft. */
const ROOT = process.cwd()

const TREES = ['src', 'showcase/src']

/** Die einzige Datei, die zugreifen darf — sie *ist* die Absicherung. */
const ALLOWED = 'src/composables/safeStorage.ts'

/** Ein Fund: wo er steht und wie die Zeile lautet. */
interface Access {
  line: number
  text: string
}

/**
 * Die Zugriffe in einem Stück TypeScript.
 *
 * @param code      Der Quelltext.
 * @param firstLine Zeilennummer, auf der `code` in der Datei beginnt. Bei einer
 *                  `.ts`-Datei ist das 1, bei einem `<script>`-Block einer SFC
 *                  dessen Anfang — sonst nennt der Fund die Zeile im Ausschnitt
 *                  statt der in der Datei.
 */
function accessesInScript(code: string, firstLine = 1): Access[] {
  const source = ts.createSourceFile('scan.ts', code, ts.ScriptTarget.Latest, true)
  const lines = code.split('\n')
  const found: Access[] = []

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === 'localStorage') {
      const { line } = source.getLineAndCharacterOfPosition(node.getStart(source))
      found.push({ line: firstLine + line, text: lines[line]?.trim() ?? '' })
    }
    ts.forEachChild(node, visit)
  }
  visit(source)

  return found
}

/**
 * Die Zugriffe in einer Datei — `.ts` direkt, `.vue` über ihre Skriptblöcke.
 *
 * @param path Absoluter Pfad der Datei.
 */
function accessesInFile(path: string): string[] {
  const content = readFileSync(path, 'utf-8')
  const where = relative(ROOT, path)

  const accesses =
    extname(path) === '.vue'
      ? scriptBlocks(content).flatMap(({ code, firstLine }) => accessesInScript(code, firstLine))
      : accessesInScript(content)

  return accesses.map(({ line, text }) => `${where}:${line} → ${text}`)
}

/**
 * Die Skriptblöcke einer SFC samt ihrer Anfangszeile in der Datei.
 *
 * Beide Formen, `<script>` und `<script setup>`, können nebeneinander stehen.
 *
 * @param content Inhalt der `.vue`-Datei.
 */
function scriptBlocks(content: string): { code: string; firstLine: number }[] {
  const { descriptor } = parseSfc(content)

  return [descriptor.script, descriptor.scriptSetup]
    .filter((block): block is NonNullable<typeof block> => block !== null)
    .map((block) => ({ code: block.content, firstLine: block.loc.start.line }))
}

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

describe('Zugriff auf den Speicher', () => {
  const offenders = TREES.flatMap((tree) => sourceFiles(join(ROOT, tree)))
    .filter((path) => relative(ROOT, path) !== ALLOWED)
    .flatMap(accessesInFile)

  it('läuft ausschließlich über `safeStorage`', () => {
    // Die Fundstellen stehen mit Datei und Zeile in der Meldung — sonst sucht
    // man sie in zwei Bäumen von Hand.
    expect(offenders, `direkter Zugriff:\n${offenders.join('\n')}`).toEqual([])
  })

  it('sieht die Ausnahme wirklich an, statt sie nur zu behaupten', () => {
    // Ohne diesen Fall liefe der Test auch dann grün, wenn er gar nichts
    // fände — er hat in dieser Datei schon drei Fehler aufgedeckt.
    expect(accessesInFile(join(ROOT, ALLOWED)).length).toBeGreaterThan(0)
  })
})

describe('Der Wächter unterscheidet Code von Text', () => {
  // Beide Fälle stammen aus Codex' Review von Runde 1 und waren mit der
  // Regex-Fassung nachweislich falsch — der erste grün, der zweite rot.

  it('findet einen Zugriff zwischen zwei Strings, die wie Kommentarmarken aussehen', () => {
    const code = [
      "const markerStart = '/*'",
      'const forbiddenStorage = window.localStorage',
      "const markerEnd = '*/'",
    ].join('\n')

    expect(accessesInScript(code)).toEqual([
      { line: 2, text: 'const forbiddenStorage = window.localStorage' },
    ])
  })

  it('meldet eine Zeichenkette nicht als Zugriff', () => {
    expect(accessesInScript("const storageApiName = 'localStorage'")).toEqual([])
  })

  it('meldet einen Kommentar nicht als Zugriff', () => {
    expect(accessesInScript('/* window.localStorage darf hier stehen */')).toEqual([])
  })

  it('meldet ein Template-Literal nicht als Zugriff', () => {
    expect(accessesInScript('const hint = `nutze localStorage nicht`')).toEqual([])
  })

  it('erfasst auch Klammerzugriff und Destrukturierung', () => {
    const code = ['const { localStorage } = window', "localStorage['key']"].join('\n')

    expect(accessesInScript(code).map((a) => a.line)).toEqual([1, 2])
  })

  it('nennt in einer SFC die Zeile der Datei, nicht die des Skriptblocks', () => {
    const sfc = [
      '<template>',
      '  <p>Text</p>',
      '</template>',
      '',
      '<script setup lang="ts">',
      'const x = window.localStorage',
      '</script>',
    ].join('\n')

    const blocks = scriptBlocks(sfc)
    const found = blocks.flatMap(({ code, firstLine }) => accessesInScript(code, firstLine))

    expect(found).toEqual([{ line: 6, text: 'const x = window.localStorage' }])
  })
})
