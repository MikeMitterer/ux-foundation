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
