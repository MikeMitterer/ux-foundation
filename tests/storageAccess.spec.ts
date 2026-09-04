/**
 * Bewacht die Speicher-Regel aus dem Skill `ux-standards`, Abschnitt „Speicher".
 *
 * Durchsucht werden `src` und `showcase/src`; erlaubt ist der Zugriff allein in
 * `safeStorage` selbst. Ausgewertet wird der Syntaxbaum — TypeScript für
 * Skripte, der SFC-Parser für `.vue` —, und zwar Skriptblöcke **und** die
 * Ausdrücke des Templates, weil auch die zu Code kompiliert werden.
 *
 * Als Zugriff zählt der Name in zwei Rollen: als Bezeichner und als
 * Zeichenkette an den Stellen, an denen sie eine Eigenschaft benennt
 * (Klammernotation, berechneter Eigenschaftsname, zweites Argument eines
 * `Reflect`-Zugriffs). Eine Zeichenkette anderswo ist Text.
 *
 * Was diese Prüfung nicht leisten kann und warum, steht im Ticket T-18 und in
 * `CLAUDE-REVIEW-PATTERNS.md`.
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
    if (refersToStorage(node)) {
      const { line } = source.getLineAndCharacterOfPosition(node.getStart(source))
      found.push({ line: firstLine + line, text: lines[line]?.trim() ?? '' })
    }
    ts.forEachChild(node, visit)
  }
  visit(source)

  return found
}

/**
 * Meint dieser Knoten den Speicher — als Name oder als Schlüssel?
 *
 * Ein Bezeichner zählt immer. Eine Zeichenkette nur dort, wo sie eine
 * Eigenschaft benennt: als Argument einer Klammernotation, als berechneter
 * Eigenschaftsname (`const { ['localStorage']: s } = window`) und als zweites
 * Argument eines `Reflect`-Zugriffs. Anderswo ist sie Text.
 *
 * @param node Der zu prüfende Knoten.
 */
function refersToStorage(node: ts.Node): boolean {
  if (ts.isIdentifier(node)) return node.text === 'localStorage'
  if (!ts.isStringLiteralLike(node) || node.text !== 'localStorage') return false

  const parent: ts.Node | undefined = node.parent
  if (parent === undefined) return false

  if (ts.isElementAccessExpression(parent)) return parent.argumentExpression === node
  if (ts.isCallExpression(parent)) return isReflectAccess(parent) && parent.arguments[1] === node
  return ts.isComputedPropertyName(parent)
}

/** Die `Reflect`-Formen, die eine Eigenschaft lesen, schreiben oder prüfen. */
const REFLECT_ACCESSORS = ['get', 'set', 'has']

/**
 * Ist das ein `Reflect.get(…)` oder eine seiner Geschwisterformen?
 *
 * @param call Der Aufrufknoten.
 */
function isReflectAccess(call: ts.CallExpression): boolean {
  const callee = call.expression
  return (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'Reflect' &&
    REFLECT_ACCESSORS.includes(callee.name.text)
  )
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
    extname(path) === '.vue' ? accessesInSfc(content) : accessesInScript(content)

  return accesses.map(({ line, text }) => `${where}:${line} → ${text}`)
}

/**
 * Die Zugriffe in einer SFC — aus den Skriptblöcken **und** dem Template.
 *
 * @param content Inhalt der `.vue`-Datei.
 */
function accessesInSfc(content: string): Access[] {
  return [...scriptBlocks(content), ...templateExpressions(content)].flatMap(
    ({ code, firstLine }) => accessesInScript(code, firstLine),
  )
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
 * Die ausführbaren Ausdrücke eines Templates, jeder mit seiner Dateizeile.
 *
 * Gemeint sind Interpolationen (`{{ … }}`) und die Werte von Direktiven
 * (`@click`, `:prop`, `v-if`, `v-for`) — alles, was Vue zu Code übersetzt.
 * Statische Attributwerte und reiner Text sind keine Ausdrücke und tauchen
 * hier nicht auf; genau deshalb bleibt ein sichtbares „localStorage" im Text
 * folgenlos.
 *
 * Der Baum wird allgemein durchlaufen statt nach Knotenarten aufgezählt: Die
 * Formen, in denen ein Ausdruck hängen kann, sind zahlreich, und eine Liste
 * davon wäre beim nächsten Direktiventyp unvollständig.
 *
 * @param content Inhalt der `.vue`-Datei.
 */
function templateExpressions(content: string): { code: string; firstLine: number }[] {
  const { descriptor } = parseSfc(content)
  if (descriptor.template === null) return []

  const found: { code: string; firstLine: number }[] = []

  const walk = (node: unknown): void => {
    if (node === null || typeof node !== 'object') return

    const candidate = node as {
      type?: number
      isStatic?: boolean
      content?: unknown
      loc?: { start?: { line?: number } }
    }

    // `4` ist `NodeTypes.SIMPLE_EXPRESSION`; statische sind Attributwerte.
    if (candidate.type === 4 && candidate.isStatic === false) {
      found.push({
        code: String(candidate.content ?? ''),
        firstLine: candidate.loc?.start?.line ?? 1,
      })
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk)
      else if (value !== null && typeof value === 'object') walk(value)
    }
  }
  walk(descriptor.template.ast)

  return found
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
    // Ohne diesen Fall liefe der Test auch dann grün, wenn er gar nichts fände.
    expect(accessesInFile(join(ROOT, ALLOWED)).length).toBeGreaterThan(0)
  })
})

describe('Der Wächter unterscheidet Code von Text', () => {

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

  it('erfasst die Klammernotation, in der der Name eine Zeichenkette ist', () => {
    const code = "const stored = window['localStorage']?.getItem(KEY)"

    expect(accessesInScript(code)).toEqual([{ line: 1, text: code }])
  })

  it('erfasst einen berechneten Eigenschaftsnamen in der Destrukturierung', () => {
    const code = "const { ['localStorage']: storage } = window"

    expect(accessesInScript(code)).toEqual([{ line: 1, text: code }])
  })

  it('erfasst die Klammernotation auch als Template-Literal', () => {
    const code = 'const stored = window[`localStorage`]'

    expect(accessesInScript(code)).toEqual([{ line: 1, text: code }])
  })

  it('erfasst `Reflect.get` als das, was es ist — ein Direktzugriff', () => {
    const code = "const stored = Reflect.get(window, 'localStorage')?.getItem(KEY)"

    expect(accessesInScript(code)).toEqual([{ line: 1, text: code }])
  })

  it('meldet ein beliebiges anderes Funktionsargument nicht', () => {
    const code = ["describe('localStorage', () => {})", "t('localStorage')"].join('\n')

    expect(accessesInScript(code)).toEqual([])
  })

  it('erfasst `Reflect.get` auch in einer Template-Expression', () => {
    const sfc = [
      '<template>',
      '  <button @click="Reflect.get(window, \'localStorage\').clear()">Mutant</button>',
      '</template>',
    ].join('\n')

    expect(accessesInSfc(sfc)).toEqual([
      { line: 2, text: "Reflect.get(window, 'localStorage').clear()" },
    ])
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

    expect(accessesInSfc(sfc)).toEqual([{ line: 6, text: 'const x = window.localStorage' }])
  })

  it('erfasst die Klammernotation auch in einer Template-Expression', () => {
    const sfc = [
      '<template>',
      '  <button @click="window[\'localStorage\'].clear()">Mutant</button>',
      '</template>',
    ].join('\n')

    expect(accessesInSfc(sfc)).toEqual([
      { line: 2, text: "window['localStorage'].clear()" },
    ])
  })

  it('findet einen Zugriff im Template, auch ohne jeden Skriptblock', () => {
    const sfc = [
      '<template>',
      '  <button @click="$event.view.localStorage.clear()">Mutant</button>',
      '</template>',
    ].join('\n')

    expect(accessesInSfc(sfc)).toEqual([
      { line: 2, text: '$event.view.localStorage.clear()' },
    ])
  })

  it('meldet sichtbaren Text im Template nicht als Zugriff', () => {
    const sfc = ['<template>', '  <p>localStorage ist hier nur ein Wort</p>', '</template>'].join(
      '\n',
    )

    expect(accessesInSfc(sfc)).toEqual([])
  })

  it('meldet einen statischen Attributwert nicht als Zugriff', () => {
    const sfc = ['<template>', '  <p title="localStorage">Text</p>', '</template>'].join('\n')

    expect(accessesInSfc(sfc)).toEqual([])
  })
})
