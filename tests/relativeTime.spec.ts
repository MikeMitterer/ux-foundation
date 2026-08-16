/** Alter eines Zeitstempels — reine Rechnung, ohne Formulierung. */
import { describe, expect, it } from 'vitest'

import { minutesSince } from '@ux/index'

const JETZT = Date.parse('2026-08-16T12:00:00Z')

describe('minutesSince', () => {
  it('rechnet volle Minuten', () => {
    expect(minutesSince('2026-08-16T11:58:30Z', JETZT)).toBe(1)
    expect(minutesSince('2026-08-16T09:00:00Z', JETZT)).toBe(180)
  })

  it('liefert null ohne Zeitstempel', () => {
    expect(minutesSince(null, JETZT)).toBeNull()
  })

  it('liefert null bei unlesbarem Zeitstempel', () => {
    expect(minutesSince('vorgestern', JETZT)).toBeNull()
  })

  it('gibt bei Zeitstempeln aus der Zukunft nicht negativ zurück', () => {
    // Kommt vor, wenn die Uhr der Gegenstelle vorgeht — „vor -3 Min" wäre Unsinn.
    expect(minutesSince('2026-08-16T12:05:00Z', JETZT)).toBe(0)
  })
})
