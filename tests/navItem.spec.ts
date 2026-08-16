/**
 * Der Menüpunkt in der Kopfzeile.
 *
 * Lag zweimal vor: in StockPortfolio als `topbar__item` mit rund siebzig Zeilen
 * SCSS, in StockInfo als `.tab` mit denselben Regeln in anderer Schreibweise.
 * Beide Male dasselbe — Symbol, Beschriftung ab `md`, Unterstrich am aktiven
 * Punkt, verstecktes Label für Hilfstechnik. Genau der Fall fürs Paket.
 *
 * Die Navigation selbst bleibt draußen: Die eine App hat einen Router, die
 * andere Hash-Tabs. Deshalb `href` hinein und ein `select`-Ereignis heraus —
 * die App entscheidet, was ein Klick bedeutet.
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { UxNavItem } from '@ux/index'

describe('UxNavItem', () => {
  it('zeigt Symbol und Beschriftung', () => {
    const wrapper = mount(UxNavItem, {
      props: { icon: 'dashboard', label: 'Übersicht' },
    })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('Übersicht')
  })

  it('trägt die Beschriftung zusätzlich für Hilfstechnik', () => {
    // Unterhalb `md` verschwindet der sichtbare Text — ein Symbol ohne
    // zugänglichen Namen ist ein Knopf ohne Namen.
    const wrapper = mount(UxNavItem, {
      props: { icon: 'settings', label: 'Einstellungen' },
    })

    expect(wrapper.find('.visually-hidden').text()).toBe('Einstellungen')
  })

  it('markiert den aktiven Punkt und meldet ihn an Hilfstechnik', () => {
    const wrapper = mount(UxNavItem, {
      props: { icon: 'dashboard', label: 'Übersicht', active: true },
    })

    expect(wrapper.classes()).toContain('ux-navitem--active')
    expect(wrapper.attributes('aria-current')).toBe('page')
  })

  it('zeigt am inaktiven Punkt keinen Unterstrich', () => {
    const wrapper = mount(UxNavItem, {
      props: { icon: 'dashboard', label: 'Übersicht' },
    })

    expect(wrapper.find('.ux-navitem__underline').exists()).toBe(false)
    expect(wrapper.attributes('aria-current')).toBeUndefined()
  })

  it('meldet den Klick, statt selbst zu navigieren', async () => {
    const wrapper = mount(UxNavItem, {
      props: { icon: 'fx', label: 'Devisen' },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('trägt die Adresse, wenn eine gegeben ist', () => {
    // Ein echter Verweis: Mittelklick und „in neuem Tab öffnen" sollen gehen.
    const wrapper = mount(UxNavItem, {
      props: { icon: 'fx', label: 'Devisen', href: '#/fx' },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('#/fx')
  })

  it('ist ohne Adresse ein Knopf', () => {
    // Ein `a` ohne `href` ist für die Tastatur nicht erreichbar.
    const wrapper = mount(UxNavItem, {
      props: { icon: 'fx', label: 'Devisen' },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
  })
})
