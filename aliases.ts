/**
 * Die Quellzuordnungen — **eine** Quelle für Schaufenster, Tests und Compiler.
 *
 * Alle drei brauchen dieselben zwei Aliase: `@ux` zeigt auf das Fundament, `@`
 * auf die Schaufenster-App. Sie standen zwischenzeitlich mehrfach da, und das
 * ist die Sorte Doppelung, vor der die Repo-Regel warnt: Verschiebt jemand ein
 * Verzeichnis und zieht nur eine Seite nach, prüft der Testlauf **andere
 * Module**, als die App lädt — und bleibt dabei grün. Das ist die teuerste
 * Sorte Fehler, weil nichts auffällt.
 *
 * Vite und Vitest lesen hier direkt. Der TypeScript-Compiler kann das nicht:
 * `tsconfig.json` ist JSON und importiert nichts. Diese eine, unvermeidbare
 * Spiegelung bewacht `tests/aliases.spec.ts` — dieselbe Lage wie bei den
 * Breakpoints, wo SCSS kein TypeScript lesen kann.
 */
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

/**
 * Die Zuordnungen als **reine Daten** — Aliasname auf Pfad ab Wurzelverzeichnis.
 *
 * Bewusst ohne aufgelöste Pfade: Diese Datei wird auch von einem Test
 * eingelesen, und der läuft unter `happy-dom`, wo `import.meta.url` keine
 * Datei-URL ist und der Zugriff **wirft**. Stünde die Auflösung auf
 * Modulebene, ließe sich die gemeinsame Quelle ausgerechnet von dem Test nicht
 * lesen, der sie bewachen soll.
 */
export const ALIAS_SOURCES: Record<string, string> = {
  /* Auf die Quellen des Fundaments statt auf ein gebautes Paket: Änderungen
     sollen im Schaufenster sofort sichtbar sein. */
  '@ux': 'src',
  '@': 'showcase/src',
}

/**
 * Dieselben Zuordnungen als absolute Pfade, wie Vite und Vitest sie brauchen.
 *
 * Die Wurzel wird **hier** bestimmt und nicht von der aufrufenden
 * Konfiguration: Sonst müsste jede wissen, wie tief sie liegt, und zwei
 * Konfigurationen in verschiedenen Tiefen lösten verschiedene Verzeichnisse
 * auf. Die Doppelung wäre dann nur durch eine Falle ersetzt.
 *
 * Der Zugriff auf `import.meta.url` steht in der Funktion und nicht daneben —
 * siehe `ALIAS_SOURCES`.
 */
export function resolveAliases(): Record<string, string> {
  const root = fileURLToPath(new URL('./', import.meta.url))

  return Object.fromEntries(
    Object.entries(ALIAS_SOURCES).map(([name, path]) => [name, resolve(root, path)]),
  )
}
