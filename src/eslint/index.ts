/**
 * Bausteine für die ESLint-Konfiguration einbindender Apps.
 *
 * **Eigener Einstiegspunkt und nicht Teil von `@mmit/ux-foundation`.** Was hier
 * liegt, gehört in eine `eslint.config.js` und nicht in eine Oberfläche.
 *
 * Die Bausteine sind **reine Daten** — sie geben `rules`-Objekte zurück und
 * importieren nichts. Deshalb kommt kein Peer dazu: Welche Regeln es gibt,
 * entscheidet die ESLint-Fassung der App.
 *
 * **Alles steht in dieser einen Datei**, entgegen dem Aufbau des übrigen
 * Pakets. Der Grund ist der Ladeweg: Eine `eslint.config.js` wird von Node
 * geladen, nicht von einem Bündler, und ein erweiterungsloser Import zwischen
 * zwei Dateien scheitert dort. Ein zweites Modul daneben wäre der einzige
 * Import im Paket, der ohne Bündler laufen müsste.
 *
 * ```js
 * import { noDirectGlobal, noDirectGlobalInTemplate, allowDirectGlobal }
 *   from '@mmit/ux-foundation/eslint'
 *
 * const storage = {
 *   name: 'localStorage',
 *   message: 'Nutze safeStorage aus @mmit/ux-foundation.',
 * }
 *
 * export default [
 *   { files: ['src/**\/*.ts'], rules: noDirectGlobal(storage) },
 *   {
 *     files: ['src/**\/*.vue'],
 *     rules: { ...noDirectGlobal(storage), ...noDirectGlobalInTemplate(storage) },
 *   },
 *   // Die eine Datei, die den Zugang anbietet:
 *   { files: ['src/lib/storage.ts'], rules: allowDirectGlobal() },
 * ]
 * ```
 *
 * Geprüft wird nicht selbst — erzeugt wird Konfiguration für die Regeln, die
 * ESLint mitbringt. Der Grund ist die **Sichtbarkeitsanalyse**: ESLint weiß, ob
 * ein Name den globalen meint oder eine lokale Bindung ihn verdeckt. Ein
 * Prüfer, der nur den Syntaxbaum liest, kann das nicht und meldete
 * `function load(fetch) { … }` als Verstoß.
 *
 * Erfasst werden der nackte Name, der Zugriff über ein Wirtsobjekt in Punkt-
 * und Klammernotation, die Destrukturierung und die statischen
 * Schlüsselzugriffe über `Reflect` und `Object`. Nicht erfasst werden reine
 * Typknoten, Objektschlüssel, Zeichenketten — und Namen, die überdeckt sind.
 *
 * **Die Grenze:** Ein zur Laufzeit zusammengesetzter Schlüssel
 * (`window['local' + 'Storage']`) wird nicht gefunden; dafür bräuchte es eine
 * Datenflussanalyse.
 */

/** Ein Eintrag, wie ihn die `rules` einer Flat-Config aufnimmt. */
export type RuleEntry = 'off' | 'error' | 'warn' | readonly unknown[]

/** Eine `rules`-Abbildung einer Flat-Config. */
export type RulesRecord = Record<string, RuleEntry>

/** Was verboten wird und wie die Meldung lautet. */
export interface DirectGlobalOptions {
  /** Der globale Name, etwa `localStorage` oder `fetch`. */
  name: string
  /** Was in der Meldung steht — üblicherweise der erlaubte Weg. */
  message: string
  /**
   * Wirtsobjekte, über die der Name ebenfalls erreichbar ist.
   *
   * Vorgabe sind die drei Namen, unter denen das globale Objekt in einem
   * Browser steht. Wer ein anderes Wirtsobjekt hat, nennt es hier.
   */
  via?: readonly string[]
}

/** Die Regeln, die dieser Helfer belegt — für die Ausnahme, siehe `allowDirectGlobal`. */
const RULE_IDS = [
  'no-restricted-globals',
  'no-restricted-properties',
  'no-restricted-syntax',
] as const

/** Statische Formen, die einen Eigenschaftsnamen als Argument nehmen. */
const STATIC_ACCESSORS = ['Reflect', 'Object']

const DEFAULT_HOSTS = ['window', 'globalThis', 'self'] as const

/**
 * Verbietet den direkten Griff auf einen globalen Namen — in Skripten.
 *
 * Gilt für `.ts`/`.js` und für den `<script>`-Teil einer SFC. Für den
 * **Template**-Teil kommt `noDirectGlobalInTemplate` dazu; die Kernregeln
 * greifen dort nicht.
 *
 * ```js
 * // eslint.config.js
 * {
 *   files: ['src/**\/*.{ts,vue}'],
 *   rules: noDirectGlobal({
 *     name: 'localStorage',
 *     message: 'Nutze safeStorage aus @mmit/ux-foundation.',
 *   }),
 * }
 * ```
 *
 * @param options Name, Meldung und Wirtsobjekte.
 */
export function noDirectGlobal(options: DirectGlobalOptions): RulesRecord {
  const { name, message } = options
  const hosts = options.via ?? DEFAULT_HOSTS

  return {
    'no-restricted-globals': ['error', { name, message }],
    'no-restricted-properties': [
      'error',
      ...hosts.map((object) => ({ object, property: name, message })),
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: staticAccessorSelector(name),
        message,
      },
    ],
  }
}

/**
 * Dieselbe Sperre für die Ausdrücke eines Vue-Templates.
 *
 * Ein Template ist ausführbarer Code — `@click="window.localStorage.clear()"`
 * steht in keinem `<script>` und wird trotzdem zu einem Zugriff kompiliert. Die
 * Kernregeln sehen es nicht; `vue/no-restricted-syntax` schon.
 *
 * Braucht `eslint-plugin-vue` in der Konfiguration der App.
 *
 * @param options Name, Meldung und Wirtsobjekte.
 */
export function noDirectGlobalInTemplate(options: DirectGlobalOptions): RulesRecord {
  const { name, message } = options
  const hosts = options.via ?? DEFAULT_HOSTS

  return {
    'vue/no-restricted-syntax': [
      'error',
      // Punktnotation am Wirtsobjekt.
      ...hosts.map((host) => ({
        selector: `MemberExpression[object.name='${host}'][property.name='${name}']`,
        message,
      })),
      // Klammernotation am Wirtsobjekt — der Name steht dort als Zeichenkette.
      ...hosts.map((host) => ({
        selector: `MemberExpression[object.name='${host}'][computed=true] > Literal[value='${name}']`,
        message,
      })),
      { selector: staticAccessorSelector(name), message },
    ],
  }
}

/**
 * Hebt die Sperre auf — für die eine Datei, die den Zugang anbietet.
 *
 * Als späterer Block in der Flat-Config, der dieselben Regeln abschaltet. Eine
 * wachsende Liste solcher Ausnahmen ist fast immer ein Zeichen, dass die Regel
 * falsch geschnitten ist.
 */
export function allowDirectGlobal(): RulesRecord {
  return Object.fromEntries(RULE_IDS.map((id) => [id, 'off']))
}

/**
 * Trifft `Reflect.get(window, 'name')` und die verwandten statischen Formen.
 *
 * Aufgezählt wird nicht die Methode, sondern das **Wirtsobjekt**: Jede statische
 * Form, die einen Eigenschaftsnamen als Zeichenkette entgegennimmt, ist ein
 * Zugriff. `deleteProperty`, `defineProperty` und
 * `getOwnPropertyDescriptor` fallen damit von selbst mit hinein, ohne dass die
 * Liste bei der nächsten Methode unvollständig wird.
 *
 * @param name Der gesuchte Name.
 */
function staticAccessorSelector(name: string): string {
  const hosts = STATIC_ACCESSORS.join('|')
  return `CallExpression[callee.object.name=/^(${hosts})$/] > Literal[value='${name}']`
}
