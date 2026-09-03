/**
 * Die Quellzuordnungen — **eine** Quelle für Schaufenster und Tests.
 *
 * Beide brauchen dieselben zwei Aliase: `@ux` zeigt auf das Fundament, `@` auf
 * die Schaufenster-App. Sie standen zwischenzeitlich zweimal da — einmal in
 * `showcase/vite.config.ts`, einmal in `vitest.config.ts` —, und das ist genau
 * die Sorte Doppelung, vor der die Repo-Regel warnt: Verschiebt jemand ein
 * Verzeichnis und zieht nur eine Seite nach, prüft Vitest ab da **andere
 * Module**, als die App lädt. Der Testlauf bliebe grün und wäre wertlos.
 *
 * Deshalb kein Konsistenztest, sondern keine zweite Quelle. Die Regel nennt
 * beides und in dieser Reihenfolge: Wo sich eine Doppelung vermeiden lässt,
 * wird sie vermieden statt bewacht.
 *
 * Die Pfade gehen von **dieser** Datei aus, also vom Wurzelverzeichnis. Damit
 * ist es gleich, aus welcher Tiefe eine Konfiguration sie einbindet — sonst
 * hätte man die Doppelung nur durch eine Falle ersetzt.
 */
import { fileURLToPath, URL } from 'node:url'

const root = new URL('./', import.meta.url)

export const ALIASES: Record<string, string> = {
  /* Auf die Quellen des Fundaments statt auf ein gebautes Paket: Änderungen
     sollen im Schaufenster sofort sichtbar sein. */
  '@ux': fileURLToPath(new URL('src', root)),
  '@': fileURLToPath(new URL('showcase/src', root)),
}
