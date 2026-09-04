/**
 * Findet direkte Zugriffe auf einen globalen Namen — für Wächter-Tests.
 *
 * Der Anwendungsfall, aus dem das entstanden ist: „Jeder Zugriff auf den
 * `localStorage` läuft über `safeStorage`." Eine solche Regel hält sich nicht
 * von selbst, und eine Erinnerung daran greift nur, wenn jemand die Datei
 * öffnet. Ein Test greift immer.
 *
 * **Ausgewertet wird der Syntaxbaum, nicht der Text.** Eine Suche über Text
 * kann Kommentar- und Stringgrenzen nicht kennen — sie kann sie nur raten und
 * liegt dabei in beide Richtungen falsch: Sie übersieht echte Zugriffe und
 * meldet harmlose Zeichenketten. Der Parser weiß dagegen, ob ein Wort ein
 * Bezeichner, eine Zeichenkette, ein Template-Literal oder ein Kommentar ist —
 * und wo es steht.
 *
 * `.vue` wird vollständig gelesen: Skriptblöcke **und** Template-Ausdrücke. Ein
 * Template ist ausführbarer Code; `@click="$event.view.localStorage.clear()"`
 * steht in keinem `<script>` und wird trotzdem zu einem Zugriff kompiliert.
 *
 * **Die Grenze:** Ein zur Laufzeit zusammengesetzter Schlüssel
 * (`window['local' + 'Storage']`) wird nicht gefunden. Dafür bräuchte es eine
 * Datenflussanalyse, die unvollständig bliebe.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, isAbsolute, join, relative, resolve } from 'node:path'

import { parse as parseSfc } from '@vue/compiler-sfc'
import ts from 'typescript'

/** Was gesucht wird und wo. */
export interface DirectAccessQuery {
  /** Der globale Name, etwa `localStorage` oder `fetch`. */
  name: string
  /** Verzeichnisse, in denen gesucht wird — relativ zu `root` oder absolut. */
  roots: string[]
  /**
   * Dateien, die den Namen benutzen dürfen — relativ zu `root`.
   *
   * Für `localStorage` ist das die Datei, die den geschützten Zugang selbst
   * anbietet. Wächst diese Liste, ist meist der Test falsch und nicht der Code.
   */
  allow?: string[]
  /** Projektwurzel; Vorgabe ist das Arbeitsverzeichnis. */
  root?: string
}

/**
 * Alle Fundstellen als `pfad:zeile → zeileninhalt`.
 *
 * Die Zeichenkette ist bewusst das Ergebnis und kein Objekt: So lässt sich
 * unmittelbar `expect(findDirectAccess(…)).toEqual([])` schreiben, und schlägt
 * es fehl, steht die Stelle lesbar in der Meldung.
 *
 * @param query Name, Suchbäume und erlaubte Dateien.
 */
export function findDirectAccess(query: DirectAccessQuery): string[] {
  const root = query.root ?? process.cwd()
  const allowed = new Set(query.allow ?? [])

  return query.roots
    .flatMap((tree) => sourceFiles(isAbsolute(tree) ? tree : resolve(root, tree)))
    .filter((path) => !allowed.has(relative(root, path)))
    .flatMap((path) => accessesInFile(path, query.name, root))
}

/**
 * Die Fundstellen in **einer** Datei, ebenfalls als `pfad:zeile → inhalt`.
 *
 * Gedacht für die Gegenprobe zum Wächter: Ein Test, der behauptet „an der
 * erlaubten Stelle *muss* etwas gefunden werden", deckt den Fall auf, in dem
 * die Erkennung gar nichts mehr findet und der Wächter trotzdem grün ist.
 *
 * @param file Pfad der Datei, relativ zu `root` oder absolut.
 * @param name Der gesuchte globale Name.
 * @param root Projektwurzel; Vorgabe ist das Arbeitsverzeichnis.
 */
export function findDirectAccessInFile(file: string, name: string, root?: string): string[] {
  const base = root ?? process.cwd()
  return accessesInFile(isAbsolute(file) ? file : resolve(base, file), name, base)
}

/** Ein Fund vor dem Formatieren. */
interface Access {
  line: number
  text: string
}

/**
 * Wertet eine Datei aus — `.ts` direkt, `.vue` über Skripte und Template.
 *
 * @param path Absoluter Pfad.
 * @param name Der gesuchte Name.
 * @param root Projektwurzel, nur für die Ausgabe des Pfads.
 */
function accessesInFile(path: string, name: string, root: string): string[] {
  const content = readFileSync(path, 'utf-8')
  const where = relative(root, path)

  const accesses =
    extname(path) === '.vue'
      ? [...scriptBlocks(content), ...templateExpressions(content)].flatMap(
          ({ code, firstLine }) => accessesInScript(code, name, firstLine),
        )
      : accessesInScript(content, name)

  return accesses.map(({ line, text }) => `${where}:${line} → ${text}`)
}

/**
 * Die Zugriffe in einem Stück TypeScript.
 *
 * @param code      Der Quelltext.
 * @param name      Der gesuchte Name.
 * @param firstLine Zeile, auf der `code` in der Datei beginnt. Bei einem
 *                  `<script>`-Block dessen Anfang — sonst nennt der Fund die
 *                  Zeile im Ausschnitt statt der in der Datei.
 */
function accessesInScript(code: string, name: string, firstLine = 1): Access[] {
  const source = ts.createSourceFile('scan.ts', code, ts.ScriptTarget.Latest, true)
  const lines = code.split('\n')
  const found: Access[] = []

  const visit = (node: ts.Node): void => {
    if (refersTo(node, name)) {
      const { line } = source.getLineAndCharacterOfPosition(node.getStart(source))
      found.push({ line: firstLine + line, text: lines[line]?.trim() ?? '' })
    }
    ts.forEachChild(node, visit)
  }
  visit(source)

  return found
}

/**
 * Meint dieser Knoten den gesuchten Namen — als Bezeichner oder als Schlüssel?
 *
 * Ein Bezeichner zählt immer. Eine Zeichenkette nur dort, wo sie eine
 * Eigenschaft benennt: als Argument einer Klammernotation, als berechneter
 * Eigenschaftsname (`const { ['localStorage']: s } = window`) und als zweites
 * Argument eines `Reflect`-Zugriffs. Anderswo ist sie Text.
 *
 * @param node Der zu prüfende Knoten.
 * @param name Der gesuchte Name.
 */
function refersTo(node: ts.Node, name: string): boolean {
  if (ts.isIdentifier(node)) return node.text === name
  if (!ts.isStringLiteralLike(node) || node.text !== name) return false

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
 * Statische Attributwerte und reiner Text sind keine Ausdrücke und tauchen hier
 * nicht auf; genau deshalb bleibt ein sichtbares Wort im Text folgenlos.
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
