/**
 * Welche Sprache beim Start gilt — und wie sie erhalten bleibt.
 *
 * Was hier liegt, ist die *Erkennung*: gespeicherte Wahl vor Browsersprache
 * vor Rückfall, die Abbildung `de-AT` → `de`, das Schreiben von
 * `document.documentElement.lang`. Das ist in jeder App dasselbe und genau die
 * Sorte Logik, die beim Nachbauen subtil falsch wird — eine vergessene
 * Reihenfolge fällt niemandem auf, sie zeigt nur manchmal die falsche Sprache.
 *
 * Was hier **nicht** liegt: die Kataloge, die i18n-Instanz und die Frage,
 * welche Sprachen eine App überhaupt hat. Das gibt der Aufrufer herein.
 */

import { safeStorage } from './safeStorage'

/**
 * Bildet eine Browsersprache auf die verfügbaren ab.
 *
 * Nur der erste Teil zählt: `de-CH` und `de-AT` sind beide Deutsch, und wer
 * die Unterschiede abbilden wollte, bräuchte Katalog um Katalog.
 *
 * @param verfuegbar Die Sprachen, für die es einen Katalog gibt.
 * @param fallback   Was gilt, wenn keine passt.
 */
export function browserLocale<T extends string>(verfuegbar: readonly T[], fallback: T): T {
  if (typeof navigator === 'undefined') return fallback

  for (const sprache of navigator.languages ?? [navigator.language]) {
    const basis = sprache.split('-')[0]?.toLowerCase()
    const treffer = verfuegbar.find((v) => v.toLowerCase() === basis)
    if (treffer) return treffer
  }
  return fallback
}

/**
 * Die Sprache, mit der die App starten soll.
 *
 * Reihenfolge ist verbindlich: gespeicherte Wahl → Browsersprache → Rückfall.
 * Eine einmal getroffene Wahl schlägt immer das, was der Browser meldet — wer
 * umgestellt hat, will nicht bei jedem Besuch erneut umstellen.
 *
 * @param verfuegbar Die Sprachen, für die es einen Katalog gibt.
 * @param fallback   Was gilt, wenn weder Wahl noch Browsersprache passen.
 * @param storageKey Schlüssel im `localStorage`, je App eigen.
 */
export function detectLocale<T extends string>(
  verfuegbar: readonly T[],
  fallback: T,
  storageKey: string,
): T {
  const gespeichert = safeStorage.read(storageKey)
  if (gespeichert && (verfuegbar as readonly string[]).includes(gespeichert)) {
    return gespeichert as T
  }
  return browserLocale(verfuegbar, fallback)
}

/**
 * Schreibt die Wahl und zieht `lang` am Wurzelelement nach.
 *
 * Das `lang` ist kein Beiwerk: Ohne es trennt der Browser Wörter nach den
 * Regeln der falschen Sprache, und Vorleseprogramme sprechen sie falsch aus.
 *
 * @param locale     Die aktive Sprache.
 * @param storageKey Schlüssel im `localStorage`, je App eigen.
 */
export function persistLocale(locale: string, storageKey: string): void {
  document.documentElement.lang = locale
  // Kein Speicher: Die Wahl gilt dann für diese Sitzung.
  safeStorage.write(storageKey, locale)
}
