/**
 * Typen zu `index.js`.
 *
 * Getrennt, weil der Runtime-Export ausführbares JavaScript sein muss: Eine
 * `eslint.config.js` lädt Node direkt, nicht ein Bündler.
 */

/** Was verboten wird und wie die Meldung lautet. */
export interface DirectGlobalOptions {
  /** Der globale Name, etwa `localStorage` oder `fetch`. */
  name: string
  /** Was in der Meldung steht — üblicherweise der erlaubte Weg. */
  message: string
  /**
   * Wirtsobjekte, über die der Name ebenfalls erreichbar ist.
   *
   * Vorgabe sind die Namen, unter denen das globale Objekt im Browser steht.
   */
  via?: readonly string[]
}

/** Eine `rules`-Abbildung, wie sie ein Flat-Config-Block aufnimmt. */
export type RulesRecord = Record<string, unknown>

/**
 * Verbietet den direkten Griff auf globale Namen — in Skripten.
 *
 * @param restrictions Alle Sperren auf einmal — die Funktion belegt feste
 *                     Regel-Kennungen und muss sie in einem Schritt zusammenführen.
 */
export function noDirectGlobals(restrictions: readonly DirectGlobalOptions[]): RulesRecord

/**
 * Dieselben Sperren für die Ausdrücke eines Vue-Templates.
 *
 * @param restrictions Alle Sperren auf einmal.
 */
export function noDirectGlobalsInTemplates(
  restrictions: readonly DirectGlobalOptions[],
): RulesRecord
