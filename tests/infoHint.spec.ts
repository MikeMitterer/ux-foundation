/**
 * Das Fragezeichen am erklärungsbedürftigen Begriff.
 *
 * Entstanden in StockPortfolio als `InfoHint.vue`; StockInfo brauchte dieselbe
 * Sache für `strict_exchange` und die Datenlage — also zieht es um, statt ein
 * zweites Mal zu entstehen. Geändert hat sich beim Umzug nur, woher die Wörter
 * und die Adressen kommen: aus Props statt aus Katalog und Router.
 *
 * Der Inhalt des Hinweises lebt in einem `NTooltip` und wird erst beim
 * Überfahren eingehängt. Geprüft wird er deshalb über `show`, nicht über einen
 * simulierten Mauszeiger — und mit `to: false`, damit er nicht ans `body`
 * teleportiert wird.
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { UxInfoHint } from '@ux/index'

/** Hängt den Hinweis mit dauerhaft offenem Tooltip ein. */
function mountOpen(props: Record<string, unknown>) {
  return mount(UxInfoHint, {
    props,
    global: { stubs: { NTooltip: false } },
    attachTo: document.body,
  })
}

describe('UxInfoHint', () => {
  it('ist ohne Vertiefung ein Knopf', () => {
    // Ein `a` ohne `href` ist für die Tastatur nicht erreichbar.
    const wrapper = mount(UxInfoHint, { props: { text: 'Kurz erklärt.' } })

    expect(wrapper.find('.ux-hint__trigger').element.tagName).toBe('BUTTON')
  })

  it('wird mit Vertiefung zu einem echten Verweis', () => {
    const wrapper = mount(UxInfoHint, {
      props: { text: 'Kurz erklärt.', moreHref: '#/method#bands' },
    })

    const trigger = wrapper.find('.ux-hint__trigger')
    expect(trigger.element.tagName).toBe('A')
    expect(trigger.attributes('href')).toBe('#/method#bands')
  })

  /*
   * Das Fragezeichen ist die Vorgabe (ux-standards, „Erklärungen in der App").
   * Wo die Erklärung aber nichts abgrenzt, sondern die Ansicht als Ganzes
   * einordnet, liest sich ein (i) treffender — es kündigt eine Auskunft an,
   * kein zu klärendes Missverständnis.
   */
  it('zeigt in der Vorgabe ein Fragezeichen', () => {
    const wrapper = mount(UxInfoHint, { props: { text: 'Kurz erklärt.' } })

    expect(wrapper.get('.ux-hint__trigger').text()).toBe('?')
    expect(wrapper.find('.ux-hint__trigger svg').exists()).toBe(false)
  })

  /*
   * Als **Form**, nicht als Zeichen — dieselbe Falle wie beim Pfeil (T-16):
   * Ein Buchstabe sitzt nach den Metriken seiner Schrift in der Zeile, nicht
   * mittig in seinem Kasten. Der Kreis hier liegt auf 12/12 der Zeichenfläche
   * und ist damit von sich aus zentriert.
   */
  it('zeigt auf Wunsch ein (i) als Form statt als Zeichen', () => {
    const wrapper = mount(UxInfoHint, { props: { text: 'Kurz erklärt.', icon: 'info' } })
    const svg = wrapper.get('.ux-hint__trigger svg')

    expect(wrapper.get('.ux-hint__trigger').text()).toBe('')
    expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    expect(svg.get('circle').attributes('cx')).toBe('12')
    expect(svg.get('circle').attributes('cy')).toBe('12')
  })

  // Das (i) trägt den Akzent: Es markiert etwas Anklickbares, und dafür ist
  // die Akzentfarbe da. Der eigene Rahmen entfällt — der Kreis ist im Zeichen.
  it('kennzeichnet die (i)-Fassung mit einem eigenen Modifier', () => {
    const wrapper = mount(UxInfoHint, { props: { text: 'Kurz erklärt.', icon: 'info' } })

    expect(wrapper.get('.ux-hint__trigger').classes()).toContain('ux-hint__trigger--info')
  })

  it('trägt den Erklärungstext als zugänglichen Namen', () => {
    // Ein „?" ohne Namen sagt Hilfstechnik nichts.
    const wrapper = mount(UxInfoHint, { props: { text: 'Kurz erklärt.' } })

    expect(wrapper.find('.ux-hint__trigger').attributes('aria-label')).toBe('Kurz erklärt.')
  })

  it('zeigt beide Verweise mit ihren Adressen', async () => {
    const wrapper = mountOpen({
      text: 'Kurz erklärt.',
      moreHref: '#/method#bands',
      moreLabel: 'Mehr dazu →',
      settingHref: '#/settings?tab=calc',
      settingLabel: 'Zur Einstellung →',
    })
    await wrapper.find('.ux-hint__trigger').trigger('mouseenter')
    await new Promise((resolve) => setTimeout(resolve, 250))

    const links = [...document.querySelectorAll<HTMLAnchorElement>('.ux-hint__link')]
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Mehr dazu →',
      'Zur Einstellung →',
    ])
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#/method#bands',
      '#/settings?tab=calc',
    ])

    wrapper.unmount()
  })

  it('lässt einen Verweis weg, dessen Beschriftung fehlt', async () => {
    // Ein Paket hat keinen Katalog — ohne Wort aus der App bleibt der Verweis
    // weg, statt ein erfundenes zu zeigen.
    const wrapper = mountOpen({
      text: 'Kurz erklärt.',
      moreHref: '#/method#bands',
      settingHref: '#/settings?tab=calc',
      settingLabel: 'Zur Einstellung →',
    })
    await wrapper.find('.ux-hint__trigger').trigger('mouseenter')
    await new Promise((resolve) => setTimeout(resolve, 250))

    const links = [...document.querySelectorAll<HTMLAnchorElement>('.ux-hint__link')]
    expect(links).toHaveLength(1)
    expect(links[0]?.textContent?.trim()).toBe('Zur Einstellung →')

    wrapper.unmount()
  })
})
