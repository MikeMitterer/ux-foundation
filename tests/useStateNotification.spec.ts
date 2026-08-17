/**
 * Tests für die Zustands-Meldung.
 *
 * Anlass war ein Fehler im Browser: Das Composable wertete den Textbaustein
 * schon während `setup()` aus. Verwies er auf eine Konstante, die weiter unten
 * in der Datei stand, warf das — und der Aufrufer musste seine Deklarationen
 * nach den Bedürfnissen des Composables ordnen. Diese Falle hält der erste
 * Test fest.
 */

import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useStateNotification } from '@ux/index'
import type { NotificationApi, NotificationReactive } from 'naive-ui'

/** Notification-API-Attrappe, die die erzeugten Meldungen sammelt. */
function fakeNotification() {
  const created: { title: string; content: string }[] = []
  const destroy = vi.fn()

  const api = {
    create: (options: { title?: string; content?: string }) => {
      created.push({ title: options.title ?? '', content: String(options.content ?? '') })
      return { destroy, content: '', meta: '' } as unknown as NotificationReactive
    },
  } as unknown as NotificationApi

  return { api, created, destroy }
}

/**
 * Attrappe, die zusätzlich mitschreibt, **wann** der Zähler gesetzt wird:
 * beim Anlegen (richtig) oder nachträglich am Objekt (bricht die Transition).
 */
function zaehlerAttrappe() {
  const optionen: { meta?: string }[] = []
  const metaSchreibzugriffe: unknown[] = []

  const api = {
    create: (options: { meta?: string }) => {
      optionen.push({ meta: options.meta })
      return new Proxy({} as NotificationReactive, {
        set(ziel, name, wert) {
          if (name === 'meta') metaSchreibzugriffe.push(wert)
          return Reflect.set(ziel, name, wert)
        },
      })
    },
  } as unknown as NotificationApi

  return { api, optionen, metaSchreibzugriffe }
}

/** Hängt das Composable in eine Komponente ein — es braucht einen Lebenszyklus. */
function mountWith(setup: () => void) {
  return mount(
    defineComponent({
      setup() {
        setup()
        return () => h('div')
      },
    }),
  )
}

describe('useStateNotification', () => {
  it('wertet den Text nicht schon während setup() aus', () => {
    // Der eigentliche Fehler: Ein Verweis auf eine später deklarierte
    // Konstante warf, bevor die Komponente überhaupt stand.
    const { api } = fakeNotification()

    expect(() =>
      mountWith(() => {
        const active = ref(true)
        useStateNotification(api, active, {
          title: 'Test',
          type: 'warning',
          // Greift auf etwas zu, das erst nach diesem Aufruf entsteht.
          content: () => spaeter.value,
          seconds: ref(0),
          countdownLabel: (n) => `schließt in ${n} s`,
        })
        const spaeter = ref('Text von weiter unten')
      }),
    ).not.toThrow()
  })

  it('zeigt eine Meldung, wenn der Zustand schon beim Aufbau gilt', () => {
    const { api, created } = fakeNotification()

    mountWith(() => {
      useStateNotification(api, ref(true), {
        title: 'Plan nicht gedeckt',
        type: 'error',
        content: () => 'Es fehlen 100 €',
        seconds: ref(0),
        countdownLabel: (n) => `schließt in ${n} s`,
      })
    })

    expect(created).toHaveLength(1)
    expect(created[0]).toEqual({ title: 'Plan nicht gedeckt', content: 'Es fehlen 100 €' })
  })

  it('zeigt nichts, solange der Zustand nicht gilt', () => {
    const { api, created } = fakeNotification()

    mountWith(() => {
      useStateNotification(api, ref(false), {
        title: 'Test',
        type: 'warning',
        content: () => 'egal',
        seconds: ref(0),
        countdownLabel: (n) => `schließt in ${n} s`,
      })
    })

    expect(created).toHaveLength(0)
  })

  it('meldet sich, sobald der Zustand eintritt', async () => {
    const { api, created } = fakeNotification()
    const active = ref(false)

    mountWith(() => {
      useStateNotification(api, active, {
        title: 'Test',
        type: 'warning',
        content: () => 'jetzt',
        seconds: ref(0),
        countdownLabel: (n) => `schließt in ${n} s`,
      })
    })

    active.value = true
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(created).toHaveLength(1)
  })

  it('gibt den ersten Zählerstand beim Anlegen mit', async () => {
    /*
     * Der Grund ist im Browser gemessen worden: Naive misst die Höhe der
     * Meldung in einem `nextTick` nach dem Einhängen und lässt sie von dort
     * aufklappen. Wurde `meta` unmittelbar nach `create()` gesetzt, brach das
     * Neuzeichnen die Transition ab — die Meldung blieb auf Höhe 0 stehen.
     *
     * Sichtbar wurde es erst ab der zweiten: Sie legte sich über die erste,
     * statt sich darunter einzureihen. Genau deshalb prüft dieser Test nicht
     * nur, *dass* der Zähler steht, sondern dass er **nicht nachträglich**
     * geschrieben wird.
     */
    const { api, optionen, metaSchreibzugriffe } = zaehlerAttrappe()

    mountWith(() => {
      useStateNotification(api, ref(true), {
        title: 'Kurse fehlen',
        type: 'error',
        content: () => '3 Kurse fehlen',
        seconds: ref(6),
        countdownLabel: (n) => `schließt in ${n} s`,
      })
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(optionen[0]?.meta, 'Der Zähler fehlt in den Anlegeoptionen').toBe('schließt in 6 s')
    expect(metaSchreibzugriffe, 'meta wurde nach dem Anlegen angefasst').toEqual([])
  })

  it('nimmt die Beschriftung des Zählers von außen', async () => {
    /*
     * Der Punkt der Übung: Im Paket steht kein sichtbarer Text. „schließt in
     * 4 s" stand hier einmal fest verdrahtet — in einer englischen Oberfläche
     * wäre es ohne jeden Hinweis deutsch geblieben.
     *
     * Deshalb prüft dieser Test nicht das Format, sondern die Herkunft: Was
     * die App liefert, steht im Toast. Nur so fällt ein Rückfall auf eine
     * eingebaute Sprache auf.
     */
    const { api, optionen } = zaehlerAttrappe()

    mountWith(() => {
      useStateNotification(api, ref(true), {
        title: 'Quotes missing',
        type: 'error',
        content: () => '3 quotes missing',
        seconds: ref(9),
        countdownLabel: (n) => `closes in ${n} s`,
      })
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(optionen[0]?.meta, 'Der Zähler kommt nicht aus dem Katalog der App').toBe('closes in 9 s')
  })

  it('lässt die Meldung ohne Zähler stehen', () => {
    // Anzeigedauer 0 heißt „stehen lassen" — dann gibt es auch nichts anzuzeigen.
    const { api, optionen } = zaehlerAttrappe()

    mountWith(() => {
      useStateNotification(api, ref(true), {
        title: 'Test',
        type: 'warning',
        content: () => 'x',
        seconds: ref(0),
        countdownLabel: (n) => `schließt in ${n} s`,
      })
    })

    expect(optionen[0]?.meta).toBeUndefined()
  })

  it('räumt beim Verlassen der Ansicht auf', () => {
    // Sonst bliebe der Zähler laufen, nachdem niemand mehr hinsieht.
    const { api, destroy } = fakeNotification()
    const wrapper = mountWith(() => {
      useStateNotification(api, ref(true), {
        title: 'Test',
        type: 'warning',
        content: () => 'x',
        seconds: ref(0),
        countdownLabel: (n) => `schließt in ${n} s`,
      })
    })

    wrapper.unmount()

    expect(destroy).toHaveBeenCalled()
  })
})
