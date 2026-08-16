/**
 * Die Theme-Auswahl.
 *
 * Lag zweimal vor: StockPortfolio baute ein Kachelraster aus
 * `THEMES[].preview`, StockInfo eines aus eigenen CSS-Variablen. Dasselbe
 * Bild, zwei Bauweisen — und das Feld `preview` im Paket existiert
 * ausschließlich für diese Darstellung.
 *
 * Die Namen der Themes kommen als Prop herein: Ein Paket hat keinen
 * Message-Katalog, und „Papier" wäre in der zweiten Sprache sofort falsch.
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { THEMES, THEME_IDS, UxThemePicker, type ThemeId } from '@ux/index'

/** Beschriftungen, wie eine App sie aus ihrem Katalog reichen würde. */
const LABELS = Object.fromEntries(THEME_IDS.map((id) => [id, `Name ${id}`])) as Record<
  ThemeId,
  string
>

function mountPicker(current: ThemeId = 'mangolila') {
  return mount(UxThemePicker, {
    props: { current, labels: LABELS, activeLabel: 'aktiv' },
  })
}

describe('UxThemePicker', () => {
  it('zeigt jede Palette des Pakets', () => {
    const wrapper = mountPicker()

    expect(wrapper.findAll('.ux-themepicker__tile')).toHaveLength(THEME_IDS.length)
  })

  it('beschriftet die Kacheln aus dem Katalog der App', () => {
    const wrapper = mountPicker()

    expect(wrapper.text()).toContain('Name paper')
  })

  it('markiert die aktive Kachel — auch für Hilfstechnik', () => {
    const wrapper = mountPicker('paper')
    const aktiv = wrapper.get('[aria-pressed="true"]')

    expect(aktiv.text()).toContain('Name paper')
    expect(aktiv.classes()).toContain('ux-themepicker__tile--active')
  })

  it('meldet die Wahl, statt sie selbst zu speichern', async () => {
    // Wo die Wahl bleibt, weiß nur die App — sie hat den Schlüssel.
    const wrapper = mountPicker('mangolila')

    await wrapper.findAll('.ux-themepicker__tile')[3].trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual([THEME_IDS[3]])
  })

  it('zeigt je Kachel vier Farbflächen aus den Vorschauwerten', () => {
    // Fläche, Karte, Text und Akzent — daran erkennt man ein Theme, bevor man
    // es anklickt.
    const wrapper = mountPicker()
    const ersteKachel = wrapper.findAll('.ux-themepicker__tile')[0]

    // Die Grundfläche trägt die drei übrigen Flecken — zusammen vier Farben.
    expect(ersteKachel.findAll('.ux-themepicker__swatch')).toHaveLength(3)
    expect(ersteKachel.get('.ux-themepicker__preview').attributes('style')).toContain(
      THEMES[THEME_IDS[0]].preview.page,
    )
  })
})
