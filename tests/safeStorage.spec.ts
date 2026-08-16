/**
 * Der localStorage, der auch ohne ihn auskommt.
 *
 * Der Fall ist nicht theoretisch: Im privaten Modus mancher Browser und bei
 * blockierten Cookies wirft schon der **Zugriff** auf `window.localStorage` —
 * nicht erst `getItem`. Ein ungeschütztes `localStorage.getItem` in einem
 * `onMounted` reißt damit das halbe Laden einer Ansicht mit.
 *
 * Was hier gespeichert wird, ist immer Bequemlichkeit: eine Theme-Wahl, ein
 * eingeklappter Block. Dafür darf keine App stehen bleiben.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { safeStorage } from '@ux/index'

const KEY = 'test.key'

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

/** Setzt einen Speicher ein — oder einen, dessen bloßer Zugriff wirft. */
function useStorage(storage: Storage | 'wirft' | undefined): void {
  if (storage === 'wirft') {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Der Zugriff auf den Speicher ist blockiert.')
      },
      configurable: true,
    })
    return
  }
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true })
}

let storage: Storage

beforeEach(() => {
  storage = fakeStorage()
  useStorage(storage)
})

afterEach(() => {
  useStorage(fakeStorage())
})

describe('safeStorage im Normalfall', () => {
  it('schreibt und liest', () => {
    expect(safeStorage.write(KEY, 'petrol')).toBe(true)
    expect(safeStorage.read(KEY)).toBe('petrol')
  })

  it('liefert null für einen unbekannten Schlüssel', () => {
    expect(safeStorage.read('gibt-es-nicht')).toBeNull()
  })

  it('entfernt einen Eintrag', () => {
    safeStorage.write(KEY, 'petrol')
    safeStorage.remove(KEY)
    expect(safeStorage.read(KEY)).toBeNull()
  })
})

describe('safeStorage bei blockiertem Speicher', () => {
  beforeEach(() => {
    useStorage('wirft')
  })

  it('liest null statt zu werfen', () => {
    expect(() => safeStorage.read(KEY)).not.toThrow()
    expect(safeStorage.read(KEY)).toBeNull()
  })

  it('meldet das misslungene Schreiben, statt zu werfen', () => {
    // `false` statt eines stillen Schluckens: Wer darauf reagieren will —
    // etwa mit einem Hinweis — kann es. Die meisten Aufrufer wollen nicht.
    expect(safeStorage.write(KEY, 'petrol')).toBe(false)
  })

  it('übersteht das Entfernen', () => {
    expect(() => safeStorage.remove(KEY)).not.toThrow()
  })
})

describe('safeStorage ohne Speicher', () => {
  beforeEach(() => {
    useStorage(undefined)
  })

  it('kommt auch ohne localStorage zurecht', () => {
    expect(safeStorage.read(KEY)).toBeNull()
    expect(safeStorage.write(KEY, 'petrol')).toBe(false)
    expect(() => safeStorage.remove(KEY)).not.toThrow()
  })
})
