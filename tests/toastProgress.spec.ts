/**
 * Wächter für den ablaufenden Balken an der Unterkante eines Toasts.
 *
 * Er hängt an einer **fremden** Klasse: `.n-notification` liefert den
 * Bezugsrahmen, in dem der Balken absolut sitzt. Das ist bewusst so — bündig
 * mit der Kante geht nicht anders —, aber es ist eine Annahme über Naives
 * Innenleben. Benennt eine neue Version die Klasse um, verschwindet der Balken
 * lautlos: Er liegt dann ohne Bezugsrahmen irgendwo im Dokument, und niemand
 * sucht danach, weil nichts kaputt aussieht.
 *
 * Genau diese Lücke schließt der erste Test hier. Die übrigen prüfen, dass der
 * Balken die Restzeit auch für Hilfstechnik trägt und bei abgeschaltetem
 * Zähler wegbleibt.
 */
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { NNotificationProvider, useNotification } from 'naive-ui'
import { afterEach, describe, expect, it } from 'vitest'

import { useStateNotification } from '@ux/composables/useStateNotification'

/** Der Klassenname, auf dem die Regel in `UxNotificationProvider` aufsetzt. */
const NAIVE_TOAST = 'n-notification'

/**
 * Hängt einen Toast ein und wartet, bis Naive ihn gezeichnet hat.
 *
 * Der Provider teleportiert ans `body` — gesucht wird deshalb im Dokument und
 * nicht im Wrapper.
 */
async function zeigeToast(seconds: number): Promise<void> {
  const Inner = defineComponent({
    setup() {
      const notification = useNotification()
      useStateNotification(notification, ref(true), {
        title: 'Kurse fehlen',
        content: () => 'Für 3 Papiere liegen keine aktuellen Kurse vor.',
        type: 'warning',
        seconds: ref(seconds),
        countdownLabel: (n) => `schließt in ${n} s`,
      })
      return () => h('div')
    },
  })

  mount(NNotificationProvider, {
    slots: { default: () => h(Inner) },
    attachTo: document.body,
  })

  await nextTick()
  await nextTick()
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('Balken im Toast', () => {
  it('findet die Naive-Klasse, auf der die Regel aufsetzt', async () => {
    await zeigeToast(5)

    expect(
      document.querySelector(`.${NAIVE_TOAST}`),
      `Naive zeichnet keine .${NAIVE_TOAST} mehr — der Balken hat damit keinen ` +
        'Bezugsrahmen und sitzt nicht mehr an der Unterkante. Die Regel in ' +
        'UxNotificationProvider.vue muss auf den neuen Klassennamen.',
    ).not.toBeNull()
  })

  it('sitzt innerhalb des Toasts', async () => {
    await zeigeToast(5)

    // Läge er daneben statt darin, wäre die Kante die des Fensters.
    const toast = document.querySelector(`.${NAIVE_TOAST}`)
    expect(toast, 'ohne Toast prüft dieser Test nichts').toBeInstanceOf(HTMLElement)
    expect(toast?.querySelector('.ux-toast-progress')).toBeInstanceOf(HTMLElement)
  })

  it('trägt die Restzeit für Hilfstechnik', async () => {
    await zeigeToast(5)

    const balken = document.querySelector('.ux-toast-progress')
    expect(balken?.getAttribute('role')).toBe('progressbar')
    expect(balken?.getAttribute('aria-label')).toBe('schließt in 5 s')
  })

  it('läuft genau so lange wie der Zähler', async () => {
    await zeigeToast(7)

    const balken = document.querySelector('.ux-toast-progress') as HTMLElement | null
    expect(balken?.style.animationDuration).toBe('7s')
  })

  it('blendet aus, wenn der Balken durch ist', async () => {
    /*
     * Die Animation ist die Uhr — nicht ein eigener Zeitgeber daneben. Der
     * Unterschied fällt erst beim Tab-Wechsel auf: Der Browser friert
     * Animationen in verborgenen Tabs ein, Zeitgeber laufen weiter. Liefe das
     * Ausblenden an einem eigenen Weckruf, wäre die Meldung beim Zurückkommen
     * weg, obwohl der Balken noch fast am Anfang steht.
     *
     * Geprüft wird das über das Ereignis selbst: `happy-dom` lässt keine
     * Animation laufen, das Ende lässt sich aber auslösen.
     */
    await zeigeToast(5)

    const balken = document.querySelector('.ux-toast-progress')
    expect(document.querySelector(`.${NAIVE_TOAST}`)).not.toBeNull()

    balken?.dispatchEvent(new Event('animationend', { bubbles: true }))
    await nextTick()
    await nextTick()

    expect(
      document.querySelector(`.${NAIVE_TOAST}`),
      'Die Meldung steht noch, obwohl der Balken durch ist',
    ).toBeNull()
  })

  it('bleibt weg, wenn der Toast stehen bleiben soll', async () => {
    // `0` heißt „nicht ausblenden" — ein Balken hätte dann nichts anzuzeigen.
    await zeigeToast(0)

    expect(document.querySelector(`.${NAIVE_TOAST}`)).not.toBeNull()
    expect(document.querySelector('.ux-toast-progress')).toBeNull()
  })
})
