/**
 * Zugriff auf den localStorage, der auch ohne ihn auskommt.
 *
 * Im privaten Modus mancher Browser und bei blockierten Cookies wirft schon
 * der **bloße Zugriff** auf `window.localStorage` — nicht erst `getItem`. Ein
 * ungeschützter Aufruf in einem `onMounted` reißt deshalb das Laden einer
 * ganzen Ansicht mit, obwohl es nur um eine Bequemlichkeit ging.
 *
 * Was hier liegt, ist nichts Kluges — es ist dasselbe `try`, viermal
 * geschrieben. Genau deshalb gehört es ins Paket: Die Kopie, die man beim
 * fünften Mal vergisst, ist der Fehler.
 *
 * Nicht dafür gedacht sind Daten, auf die eine App angewiesen ist. Was
 * verloren gehen darf, gehört hierher — Theme, Sprache, ein eingeklappter
 * Block. Alles andere in eine Datenbank.
 */

/** Liefert den Speicher oder `null`, wenn er nicht zu haben ist. */
function storage(): Storage | null {
  try {
    return window.localStorage ?? null
  } catch {
    return null
  }
}

export const safeStorage = {
  /**
   * Liest einen Wert.
   *
   * @param key Schlüssel im Speicher.
   * @returns Der Wert, oder `null` wenn er fehlt oder der Speicher blockiert ist.
   */
  read(key: string): string | null {
    try {
      return storage()?.getItem(key) ?? null
    } catch {
      return null
    }
  },

  /**
   * Schreibt einen Wert.
   *
   * Der Rückgabewert macht das Misslingen sichtbar, statt es zu verschlucken:
   * Wer darauf reagieren will, kann es — die meisten Aufrufer wollen nicht,
   * für sie gilt dann eben nur diese Sitzung.
   *
   * @param key   Schlüssel im Speicher.
   * @param value Der zu schreibende Wert.
   * @returns `true` wenn geschrieben wurde, sonst `false`.
   */
  write(key: string, value: string): boolean {
    try {
      const store = storage()
      if (!store) return false
      store.setItem(key, value)
      return true
    } catch {
      return false
    }
  },

  /**
   * Entfernt einen Eintrag.
   *
   * @param key Schlüssel im Speicher.
   * @returns `true` wenn entfernt wurde, sonst `false`.
   */
  remove(key: string): boolean {
    try {
      const store = storage()
      if (!store) return false
      store.removeItem(key)
      return true
    } catch {
      return false
    }
  },
}
