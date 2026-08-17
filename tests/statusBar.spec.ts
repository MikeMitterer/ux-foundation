/**
 * Die Statuszeile — und die Frage, wann der Zustandsbereich erscheint.
 *
 * Der Anlass ist ein realer Fehler: Die Sichtbarkeit hing an der **Adresse**
 * der Gegenstelle. Eine App, die ihren Zustand kennt, aber keine Adresse
 * anzeigt (weil sie über einen Proxy spricht), verlor damit den ganzen
 * Bereich — samt dem farbigen Punkt, der das Wichtigste daran ist.
 *
 * Die Adresse ist der Zusatz, der Zustand die Aussage.
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { UxStatusBar } from '@ux/index'

describe('UxStatusBar', () => {
  it('fügt ohne Beschriftung keinen fest verdrahteten Herkunftstext ein', () => {
    const wrapper = mount(UxStatusBar, {
      props: { appName: 'Test', originName: 'Foundation' },
    })

    expect(wrapper.text()).toBe('Test Foundation')
  })

  it('zeigt den Zustandspunkt auch ohne Adresse der Gegenstelle', () => {
    const wrapper = mount(UxStatusBar, {
      props: { appName: 'Test', backendState: 'online', backendStateLabel: 'Online' },
    })

    expect(wrapper.find('.ux-statusbar__dot').exists()).toBe(true)
  })

  it('nennt den Zustand ausgeschrieben — Farbe trägt nie allein', () => {
    const wrapper = mount(UxStatusBar, {
      props: { appName: 'Test', backendState: 'offline', backendStateLabel: 'Nicht erreichbar' },
    })

    expect(wrapper.text()).toContain('Nicht erreichbar')
  })

  it('schweigt, solange nichts über die Gegenstelle bekannt ist', () => {
    // `unknown` ohne Adresse und ohne Beschriftung: Dann gibt es nichts zu
    // sagen, und ein grauer Punkt ohne Aussage ist schlechter als keiner.
    const wrapper = mount(UxStatusBar, { props: { appName: 'Test' } })

    expect(wrapper.find('.ux-statusbar__dot').exists()).toBe(false)
  })

  it('meldet den Klick auf den Zustandsbereich', async () => {
    const wrapper = mount(UxStatusBar, {
      props: { appName: 'Test', backendState: 'offline', backendStateLabel: 'Offline' },
    })

    await wrapper.get('.ux-statusbar__backend').trigger('click')

    expect(wrapper.emitted('backend-click')).toHaveLength(1)
  })
})
