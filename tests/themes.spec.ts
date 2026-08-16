/**
 * Prüft, dass die Theme-Liste und die Token-Datei nicht auseinanderlaufen.
 *
 * Der Grund ist ein realer Vorfall: Eine Palette wurde im Code korrigiert, die
 * Referenz daneben nicht — und beide behaupteten dieselbe Zahl. Genau das
 * fängt der letzte Test hier ab, und zwar bevor es jemand ausliefert.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, isThemeId, THEME_IDS, THEMES } from '@ux/index'

/*
 * Über das Arbeitsverzeichnis und nicht über `import.meta.url`: Die Tests
 * laufen unter `happy-dom`, und dort ist `import.meta.url` keine Datei-URL —
 * `fileURLToPath` wirft dann „The URL must be of scheme file".
 */
const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')

/** Alle Themes, für die die Token-Datei tatsächlich eine Palette definiert. */
function themesInCss(): string[] {
  const treffer = [...tokensCss.matchAll(/:root\[data-theme='([\w-]+)'\]\s*\{([^}]*)\}/g)]
  return [...new Set(treffer.filter((m) => m[2].includes('--surface-page')).map((m) => m[1]))]
}

describe('THEMES', () => {
  it('hat zu jeder Kennung einen Eintrag', () => {
    for (const id of THEME_IDS) {
      expect(THEMES[id], `Eintrag fehlt: ${id}`).toBeDefined()
      expect(THEMES[id].id).toBe(id)
    }
  })

  it('führt keine Einträge ohne Kennung', () => {
    expect(Object.keys(THEMES).sort()).toEqual([...THEME_IDS].sort())
  })

  it('hat je Theme vier gültige Vorschaufarben', () => {
    for (const id of THEME_IDS) {
      const { page, card, ink, accent } = THEMES[id].preview
      for (const [name, wert] of Object.entries({ page, card, ink, accent })) {
        expect(wert, `${id}.${name}`).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
  })

  it('kennt die beiden Vorgaben', () => {
    expect(isThemeId(DEFAULT_DARK_THEME)).toBe(true)
    expect(isThemeId(DEFAULT_LIGHT_THEME)).toBe(true)
    expect(THEMES[DEFAULT_DARK_THEME].isDark).toBe(true)
    expect(THEMES[DEFAULT_LIGHT_THEME].isDark).toBe(false)
  })
})

describe('isThemeId', () => {
  it('nimmt bekannte Kennungen an', () => {
    expect(isThemeId('mangolila')).toBe(true)
  })

  it('weist alles andere ab', () => {
    for (const wert of ['ml-duo', '', 'MANGOLILA', null, undefined, 42, {}]) {
      expect(isThemeId(wert), String(wert)).toBe(false)
    }
  })
})

describe('Token-Datei und Theme-Liste', () => {
  it('beschreiben dieselben Themes', () => {
    expect(themesInCss().sort()).toEqual([...THEME_IDS].sort())
  })

  it('setzen je Theme die Pflicht-Token', () => {
    const pflicht = [
      '--surface-page',
      '--surface-card',
      '--surface-raised',
      '--surface-sunken',
      '--text-primary',
      '--text-secondary',
      '--text-muted',
      '--border-default',
      '--border-subtle',
      '--accent',
      '--accent-contrast',
    ]

    for (const treffer of tokensCss.matchAll(/:root\[data-theme='([\w-]+)'\]\s*\{([^}]*)\}/g)) {
      const [, name, block] = treffer
      if (!block.includes('--surface-page')) continue
      for (const token of pflicht) {
        expect(block, `${name}: ${token} fehlt`).toContain(`${token}:`)
      }
    }
  })
})
