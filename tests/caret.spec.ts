/**
 * Der Pfeil, der eine aufklappbare Fläche als solche kenntlich macht.
 *
 * Lag viermal vor (T-16): zweimal in StockInfo als Zeichen `⌄`, dreimal in
 * StockPortfolio als SVG — mit identischem Pfad, aber vier verschiedenen
 * Strichstärken, Größen und Deckkräften. Abgeschrieben und danach einzeln
 * verstellt, also genau der Fall fürs Paket.
 *
 * Die Bewegung bleibt eine Entscheidung des Aufrufers, weil beide Fassungen
 * etwas anderes sagen: `flip` heißt „hier geht etwas auf", `turn` heißt „hier
 * hängt etwas darunter".
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { UxCaret } from '@ux/index'

describe('UxCaret', () => {
  it('zeichnet ein Strichsymbol in currentColor', () => {
    const wrapper = mount(UxCaret, { props: { open: false } })

    expect(wrapper.element.tagName.toLowerCase()).toBe('svg')
    expect(wrapper.attributes('stroke')).toBe('currentColor')
    expect(wrapper.attributes('fill')).toBe('none')
  })

  /*
   * Der Kern des Tickets: Das vorherige Zeichen U+2304 sitzt tief in seinem
   * Em-Quadrat und kippt beim Drehen nach oben — eine feste optische Korrektur
   * kann deshalb nie beide Zustände treffen. Die Form hier liegt symmetrisch um
   * die Kastenmitte, also verschiebt die Drehung sie nicht.
   */
  it('trägt eine um die Kastenmitte symmetrische Form', () => {
    const wrapper = mount(UxCaret, { props: { open: false } })
    const d = wrapper.get('path').attributes('d') ?? ''

    const zahlen = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
    const xs = zahlen.filter((_, i) => i % 2 === 0)
    const ys = zahlen.filter((_, i) => i % 2 === 1)

    expect(wrapper.attributes('viewBox')).toBe('0 0 24 24')
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBe(12)
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBe(12)
  })

  it('markiert den offenen Zustand', () => {
    expect(mount(UxCaret, { props: { open: true } }).classes()).toContain('ux-caret--open')
    expect(mount(UxCaret, { props: { open: false } }).classes()).not.toContain('ux-caret--open')
  })

  /*
   * Zwei Bewegungen, weil die Fundstellen zwei verschiedene Dinge sagen. Die
   * Vorgabe ist `flip` — so verwenden es die Zeile in StockInfo und die
   * KPI-Karte, also die Mehrheit.
   */
  it('kennt beide Bewegungen und nimmt flip als Vorgabe', () => {
    expect(mount(UxCaret, { props: { open: false } }).classes()).toContain('ux-caret--flip')
    expect(mount(UxCaret, { props: { open: false, motion: 'turn' } }).classes())
      .toContain('ux-caret--turn')
  })

  // Den Zustand sagt `aria-expanded` am Knopf, zu dem der Pfeil gehört. Ein
  // vorgelesener Pfeil wäre dieselbe Auskunft ein zweites Mal, nur stummer.
  it('bleibt für Hilfstechnik unsichtbar', () => {
    expect(mount(UxCaret, { props: { open: false } }).attributes('aria-hidden')).toBe('true')
  })

  /*
   * Größe als Stufe, nicht als freie Zahl: Die vier Fundstellen hatten 0.7,
   * 0.75, 0.875 und 0.95 rem — Unterschiede, die niemand entschieden hat.
   */
  it('bietet zwei Größenstufen', () => {
    expect(mount(UxCaret, { props: { open: false } }).classes()).toContain('ux-caret--md')
    expect(mount(UxCaret, { props: { open: false, size: 'sm' } }).classes())
      .toContain('ux-caret--sm')
  })
})
