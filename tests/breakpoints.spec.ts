/**
 * Die Umschaltpunkte — und der Wächter, der ihre zweite Quelle bewacht.
 *
 * Die Grenzen stehen zweimal im Paket: als SCSS-Variablen für die Mixins und
 * als TypeScript-Konstanten für alles, was zur Laufzeit messen muss. Anders
 * geht es nicht — SCSS kann kein TypeScript lesen. Sie dürfen aber nicht
 * auseinanderlaufen, sonst kippt das Layout bei einer anderen Breite als die
 * Ansicht, und dieser Fehler zeigt sich nur auf einem schmalen Fenster.
 *
 * Deshalb der dritte Test: Er liest die SCSS-Datei und vergleicht.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import { BREAKPOINTS, COMPACT_BREAKPOINT_PX, useIsCompact } from '@ux/index'

/** Stellt `matchMedia` so, als sei das Fenster schmal oder breit. */
function pretendNarrow(narrow: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: narrow && query.includes('max-width'),
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('BREAKPOINTS', () => {
  it('nennt die vier verbindlichen Stufen', () => {
    expect(BREAKPOINTS).toEqual({ sm: 640, md: 768, lg: 1024, xl: 1280 })
  })

  it('setzt den Umschaltpunkt der Kartenansicht auf `md`', () => {
    // Die eine Grenze, die zählt: darunter eine Spalte und Karten statt Tabelle.
    expect(COMPACT_BREAKPOINT_PX).toBe(BREAKPOINTS.md)
  })

  it('stimmt mit den SCSS-Variablen überein', () => {
    // Über `process.cwd()` statt `import.meta.url`: Unter happy-dom ist die
    // Modul-Adresse eine http-URL, `fileURLToPath` wirft darauf.
    const shared = readFileSync(resolve(process.cwd(), 'src/styles/_shared.scss'), 'utf8')

    for (const [name, wert] of Object.entries(BREAKPOINTS)) {
      const treffer = new RegExp(`\\$bp-${name}:\\s*(\\d+)px`).exec(shared)
      expect(treffer, `$bp-${name} fehlt in _shared.scss`).not.toBeNull()
      expect(Number(treffer?.[1])).toBe(wert)
    }
  })
})

describe('useIsCompact', () => {
  // `nextTick`, weil der erste Wert aus `onMounted` kommt — vor dem Einhängen
  // kann niemand messen, wie breit das Fenster ist.
  it('meldet schmale Fenster', async () => {
    pretendNarrow(true)
    const wrapper = mountWithCompact()
    await nextTick()
    expect(wrapper.text()).toBe('schmal')
  })

  it('meldet breite Fenster', async () => {
    pretendNarrow(false)
    const wrapper = mountWithCompact()
    await nextTick()
    expect(wrapper.text()).toBe('breit')
  })
})

/** Hängt das Composable in eine Komponente ein — es braucht einen Lebenszyklus. */
function mountWithCompact() {
  return mount(
    defineComponent({
      setup() {
        const isCompact = useIsCompact()
        return () => h('div', isCompact.value ? 'schmal' : 'breit')
      },
    }),
  )
}
