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
import { defineComponent, h, nextTick, ref } from 'vue'
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

/**
 * Holt die Beschriftung der Restzeit aus dem, was als `meta` mitgegeben wurde.
 *
 * `meta` ist seit dem Balken eine Render-Funktion und keine Zeichenkette mehr.
 * Geprüft wird trotzdem dasselbe wie vorher: dass die Restzeit dort steht und
 * aus dem Katalog der App stammt — sie sitzt nur nicht mehr im Bild, sondern
 * am `aria-label`.
 */
function restzeitLabel(meta: unknown): unknown {
  if (typeof meta !== 'function') return meta
  const vnode = (meta as () => { props?: Record<string, unknown> })()
  return vnode?.props?.['aria-label']
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

  it('gibt den Balken beim Anlegen mit', async () => {
    /*
     * Der Grund ist im Browser gemessen worden: Naive misst die Höhe der
     * Meldung in einem `nextTick` nach dem Einhängen und lässt sie von dort
     * aufklappen. Wurde `meta` unmittelbar nach `create()` gesetzt, brach das
     * Neuzeichnen die Transition ab — die Meldung blieb auf Höhe 0 stehen.
     *
     * Sichtbar wurde es erst ab der zweiten: Sie legte sich über die erste,
     * statt sich darunter einzureihen. Genau deshalb prüft dieser Test nicht
     * nur, *dass* der Balken steht, sondern dass er **nicht nachträglich**
     * geschrieben wird.
     *
     * Seit die Bewegung aus CSS kommt, gibt es ohnehin nichts mehr
     * nachzuziehen — der Test bleibt trotzdem: Er hält fest, dass es dabei
     * bleibt.
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

    expect(restzeitLabel(optionen[0]?.meta), 'Der Balken fehlt in den Anlegeoptionen').toBe(
      'schließt in 6 s',
    )
    expect(metaSchreibzugriffe, 'meta wurde nach dem Anlegen angefasst').toEqual([])
  })

  it('nimmt die Beschriftung der Restzeit von außen', async () => {
    /*
     * Der Punkt der Übung: Im Paket steht kein sichtbarer Text. „schließt in
     * 4 s" stand hier einmal fest verdrahtet — in einer englischen Oberfläche
     * wäre es ohne jeden Hinweis deutsch geblieben.
     *
     * Dass die Beschriftung heute nur noch am `aria-label` hängt, ändert
     * daran nichts: Vorgelesen wird sie trotzdem, und in der falschen Sprache
     * fiele es nur niemandem beim Ansehen auf.
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

    expect(restzeitLabel(optionen[0]?.meta), 'Die Restzeit kommt nicht aus dem Katalog der App').toBe(
      'closes in 9 s',
    )
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

/**
 * Attrappe, die Schreibzugriffe auf `title` mitschreibt.
 *
 * `fakeNotification` sammelt nur, was beim **Anlegen** mitgegeben wurde. Für
 * eine bereits offene Meldung ist aber genau die Nachbesserung am Objekt der
 * Punkt — sonst bliebe die Überschrift stehen, während der Text mitwechselt.
 */
function titleRecordingNotification() {
  const created: string[] = []
  const written: unknown[] = []

  const api = {
    create: (options: { title?: string }) => {
      created.push(options.title ?? '')
      return new Proxy({ destroy: vi.fn() } as unknown as NotificationReactive, {
        set(target, name, value) {
          if (name === 'title') written.push(value)
          return Reflect.set(target, name, value)
        },
      })
    },
  } as unknown as NotificationApi

  return { api, created, written }
}

/**
 * Die Überschrift folgt der Sprache — der Fehler, der das ausgelöst hat.
 *
 * Gefunden in StockInfo: Nach einem Sprachwechsel **ohne Neuladen** stand
 * „Fehler" über einem englischen Text. Der Fließtext ist eine Funktion und
 * wurde neu ausgewertet, die Überschrift war ein Wert und blieb auf der
 * Sprache vom Aufbau stehen.
 *
 * Ein Getter beim Aufrufer half nicht: `useNotifier` reicht die Optionen als
 * Spread weiter, und der kopiert den Wert. Deshalb nimmt `title` jetzt auch
 * eine Funktion — wie `content` seit jeher.
 */
describe('Überschrift als Funktion', () => {
  it('nimmt beim Anlegen den aktuellen Stand, nicht den vom Aufbau', async () => {
    const { api, created } = titleRecordingNotification()
    const locale = ref('de')
    const active = ref(false)

    mountWith(() => {
      useStateNotification(api, active, {
        title: () => (locale.value === 'de' ? 'Fehler' : 'Error'),
        type: 'error',
        content: () => 'x',
        seconds: ref(0),
        countdownLabel: (n) => `schließt in ${n} s`,
      })
    })

    // Die Sprache wechselt, **bevor** die Meldung entsteht.
    locale.value = 'en'
    await nextTick()
    active.value = true
    await nextTick()

    expect(created).toEqual(['Error'])
  })

  /*
   * **Der Text bleibt hier absichtlich gleich.**
   *
   * Die erste Fassung ließ ihn mitwechseln — dann feuert der Watcher schon
   * wegen des Textes, und ob die Überschrift in seinen Quellen steht, ist
   * nicht mehr unterscheidbar. Der Mutant „Überschrift aus den Quellen
   * entfernt" blieb prompt grün. Nur ein Wechsel, den **allein** die
   * Überschrift auslöst, prüft die Zusage.
   */
  it('zieht die Überschrift einer offenen Meldung nach, auch wenn der Text gleich bleibt', async () => {
    const { api, written } = titleRecordingNotification()
    const locale = ref('de')

    mountWith(() => {
      useStateNotification(api, ref(true), {
        title: () => (locale.value === 'de' ? 'Fehler' : 'Error'),
        type: 'error',
        content: () => 'unveränderter Text',
        seconds: ref(0),
        countdownLabel: (n) => `schließt in ${n} s`,
      })
    })
    await nextTick()

    locale.value = 'en'
    await nextTick()

    expect(written).toContain('Error')
  })

  /*
   * Die Gegenprobe: Ein Aufrufer ohne Übersetzung gibt weiter eine
   * Zeichenkette. Ginge das verloren, wäre aus einer Erweiterung ein Bruch
   * geworden — und zwar für jede App, die das Paket einbindet.
   */
  it('nimmt weiterhin eine Zeichenkette', async () => {
    const { api, created } = titleRecordingNotification()

    mountWith(() => {
      useStateNotification(api, ref(true), {
        title: 'Fester Titel',
        type: 'info',
        content: () => 'x',
        seconds: ref(0),
        countdownLabel: (n) => `schließt in ${n} s`,
      })
    })
    await nextTick()

    expect(created).toEqual(['Fester Titel'])
  })
})
