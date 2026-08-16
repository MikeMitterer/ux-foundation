/**
 * Die Symbole sind Daten und damit prüfbar.
 *
 * Wert des Tests: Ein Symbol ohne Pfade rendert als leeres Kästchen — das
 * fällt in einer Kopfzeile mit vier Symbolen erst auf, wenn jemand hinsieht.
 */
import { describe, expect, it } from 'vitest'

import { NAV_ICON_NAMES, NAV_ICONS } from '@ux/index'

describe('NAV_ICONS', () => {
  it('deckt alle Kennungen ab', () => {
    expect(NAV_ICON_NAMES.sort()).toEqual(Object.keys(NAV_ICONS).sort())
  })

  it('kennt die wiederkehrenden Bereiche beider Apps', () => {
    // Wiederkehrende Menüpunkte tragen über alle Apps dasselbe Symbol — das
    // ist der Punkt, an dem eine Sammlung zusammenwächst oder auseinanderfällt.
    // StockPortfolio bringt die ersten vier, StockInfo die letzten drei.
    for (const name of ['dashboard', 'rebalancing', 'instruments', 'settings',
                        'exchanges', 'fx', 'analysis'] as const) {
      expect(NAV_ICONS[name], name).toBeDefined()
    }
  })

  it('hat je Symbol eine Zeichenfläche und mindestens einen Pfad', () => {
    for (const name of NAV_ICON_NAMES) {
      const icon = NAV_ICONS[name]
      expect(icon.viewBox, name).toMatch(/^0 0 \d+ \d+$/)
      expect(icon.paths.length, name).toBeGreaterThan(0)
    }
  })

  it('beschreibt jeden Pfad entweder als Pfaddaten oder als Kreis', () => {
    for (const name of NAV_ICON_NAMES) {
      for (const [index, path] of NAV_ICONS[name].paths.entries()) {
        expect(Boolean(path.d) !== Boolean(path.circle), `${name}[${index}]`).toBe(true)
      }
    }
  })
})
