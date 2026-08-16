/**
 * Sprach-Erkennung — die Reihenfolge ist das Eigentliche.
 *
 * Geprüft wird über den Barrel `@ux/index`, nicht über den Dateipfad: Was
 * eine App nicht importieren kann, existiert für sie nicht. Genau daran ist
 * diese Sammlung schon einmal vorbeigelaufen — die Funktionen lagen im Paket,
 * waren aber nicht exportiert, und jede App baute sie neu.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { browserLocale, detectLocale, persistLocale } from '@ux/index'

const VERFUEGBAR = ['de', 'en'] as const
const STORAGE_KEY = 'test.locale'

/** Stellt die Sprachliste des Browsers, in Präferenz-Reihenfolge. */
function pretendBrowser(...sprachen: string[]): void {
  vi.stubGlobal('navigator', { languages: sprachen, language: sprachen[0] ?? '' })
}

/** Ersatz für den localStorage — happy-dom bringt einen mit, dieser ist leer. */
function fakeStorage(): Storage {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() {
      return values.size
    },
  } as Storage
}

let storage: Storage

beforeEach(() => {
  storage = fakeStorage()
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('browserLocale', () => {
  it('bildet Landesvarianten auf die Basis-Sprache ab', () => {
    pretendBrowser('de-AT')
    expect(browserLocale(VERFUEGBAR, 'en')).toBe('de')
  })

  it('geht die ganze Liste durch, nicht nur den ersten Eintrag', () => {
    // Wer Englisch zuerst und Deutsch danach führt, hat trotzdem Deutsch —
    // die erste Sprache mit Katalog gewinnt, nicht die erste überhaupt.
    pretendBrowser('fr-FR', 'de-CH', 'en-US')
    expect(browserLocale(VERFUEGBAR, 'en')).toBe('de')
  })

  it('nimmt den Rückfall, wenn keine Sprache einen Katalog hat', () => {
    pretendBrowser('fr-FR', 'it-IT')
    expect(browserLocale(VERFUEGBAR, 'en')).toBe('en')
  })
})

describe('detectLocale', () => {
  it('lässt die gespeicherte Wahl den Browser überstimmen', () => {
    pretendBrowser('de-AT')
    storage.setItem(STORAGE_KEY, 'en')
    expect(detectLocale(VERFUEGBAR, 'en', STORAGE_KEY)).toBe('en')
  })

  it('fragt ohne gespeicherte Wahl den Browser', () => {
    pretendBrowser('de-AT')
    expect(detectLocale(VERFUEGBAR, 'en', STORAGE_KEY)).toBe('de')
  })

  it('ignoriert eine gespeicherte Sprache ohne Katalog', () => {
    pretendBrowser('de-AT')
    storage.setItem(STORAGE_KEY, 'kl')
    expect(detectLocale(VERFUEGBAR, 'en', STORAGE_KEY)).toBe('de')
  })
})

describe('persistLocale', () => {
  it('schreibt die Wahl und zieht `lang` am Wurzelelement nach', () => {
    persistLocale('de', STORAGE_KEY)
    expect(storage.getItem(STORAGE_KEY)).toBe('de')
    expect(document.documentElement.lang).toBe('de')
  })
})
