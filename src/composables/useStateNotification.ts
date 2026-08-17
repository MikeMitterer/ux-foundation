/**
 * Zeigt einen Toast, solange ein Zustand anhält.
 *
 * Toasts sind eigentlich für Ereignisse gedacht: einmal aufblitzen, dann weg.
 * Die Meldungen im Rebalancing sind aber Zustände — „der Plan ist nicht
 * gedeckt" bleibt wahr, bis man etwas ändert. Eine Einblendung, die nach fünf
 * Sekunden verschwindet, wäre also gelogen; eine Meldung im Fluss der Seite
 * verschiebt dafür beim Tippen die Tabelle.
 *
 * Deshalb hier beides: Der Toast erscheint, wenn der Zustand eintritt, und
 * verschwindet von selbst, sobald die Ursache behoben ist. Zusätzlich läuft
 * ein Balken an seiner Unterkante mit, nach dem er sich ausblendet, auch wenn
 * der Zustand noch besteht — sonst steht er einem beim Tippen dauerhaft im
 * Weg. Wer ihn lieber stehen hat, stellt die Anzeigedauer auf 0.
 *
 * **Gehört unter `UxNotificationProvider`, nicht unter `NNotificationProvider`.**
 * Dort steht die Stilvorlage des Balkens, und weil das Ausblenden am Ende
 * seiner Animation hängt, bliebe eine Meldung ohne sie stehen. Der Provider
 * bringt außerdem den Versatz unter die Kopfzeile mit.
 *
 * Ausgeblendet heißt nicht erledigt: Der Zustand steht weiterhin im Kopf der
 * Seite („nicht gedeckt"), und sobald er zwischendurch weg war und wiederkehrt,
 * meldet sich der Toast erneut.
 */

import { h, onMounted, onUnmounted, watch, type Ref, type VNodeChild } from 'vue'
import type { NotificationApi, NotificationReactive } from 'naive-ui'

/**
 * Die Farbe des Balkens je Art — dieselbe Bedeutung wie das Symbol daneben.
 *
 * Eine eigene Farbe wäre eine zweite Bedeutungsebene: Ein blauer Balken an
 * einer roten Meldung liest sich als zweite Aussage, obwohl er nur die Zeit
 * zeigt.
 */
const BALKEN_FARBE: Record<StateNotificationOptions['type'], string> = {
  error: '--status-out',
  warning: '--status-near',
  info: '--accent',
}

export interface StateNotificationOptions {
  /** Überschrift des Toasts. */
  title: string
  /** Fließtext — wird bei jeder Änderung neu ausgewertet. */
  content: () => string
  type: 'error' | 'warning' | 'info'
  /**
   * Sekunden bis zum selbsttätigen Ausblenden; `0` lässt den Toast stehen.
   * Als Ref, damit eine Änderung in den Einstellungen sofort greift.
   */
  seconds: Ref<number>
  /**
   * Beschriftung der Restzeit, bereits übersetzt — „schließt in 5 s".
   *
   * Kommt herein statt fest zu stehen, und ohne deutschen Rückfall: Ein Paket
   * hat keinen Katalog, und ein fest verdrahtetes Wort ist in der zweiten
   * Sprache sofort falsch. Pflicht statt optional, damit das Vergessen beim
   * Übersetzen auffällt und nicht erst im englischen Bildschirmfoto.
   *
   * **Sie steht nicht mehr im Bild**, seit der Balken die Restzeit zeigt —
   * sie ist das `aria-label` dazu. Ein Balken ohne Text ist für Hilfstechnik
   * stumm, und Form allein trägt keine Information.
   *
   * @param remaining Gesamtdauer in ganzen Sekunden, immer größer als 0.
   *                  Wird **einmal** beim Anlegen aufgerufen, nicht je Sekunde.
   */
  countdownLabel: (remaining: number) => string
}

/**
 * @param notification Naive-UI-API aus `useNotification()`.
 * @param active       Zustand; `true` zeigt den Toast.
 * @param options      Aussehen, Text und Zähler.
 */
export function useStateNotification(
  notification: NotificationApi,
  active: Ref<boolean>,
  options: StateNotificationOptions,
): void {
  let handle: NotificationReactive | null = null

  /** Der Toast ist weg — nicht sofort wieder aufpoppen. */
  let dismissed = false

  function close(): void {
    handle?.destroy()
    handle = null
  }

  /**
   * Der mitlaufende Balken an der Unterkante — `undefined`, solange keiner läuft.
   *
   * Er ersetzt den früheren Text („schließt in 4 s") und ist deshalb **kein**
   * reiner Zierrat: Die Beschriftung wandert nach `aria-label`, sonst wäre die
   * Restzeit für Hilfstechnik verschwunden. Sie wird einmal gesetzt und nicht
   * je Sekunde nachgezogen — ein sich fortlaufend änderndes Label liest ein
   * Screenreader unter Umständen jedes Mal vor.
   *
   * Die Dauer steht als Inline-Angabe am Element und nicht in der Stilvorlage:
   * Naives Notification kennt weder `style` noch `class` als Option, und die
   * Dauer ist je Meldung verschieden.
   *
   * **Der Balken ist zugleich die Uhr.** Ausgeblendet wird nicht nach einem
   * eigenen Weckruf, sondern wenn seine Animation durch ist — die beiden
   * können damit nicht auseinanderlaufen. Der Unterschied zeigt sich, sobald
   * jemand den Tab wechselt: Der Browser friert Animationen in verborgenen
   * Tabs ein, Zeitgeber laufen weiter. Mit einem eigenen Weckruf verschwand
   * die Meldung, während der Balken noch fast am Anfang stand — beim
   * Zurückkommen also eine Meldung, die man nie gesehen hat.
   */
  function progressBar(total: number): (() => VNodeChild) | undefined {
    if (total <= 0) return undefined

    const label = options.countdownLabel(total)
    return () =>
      h('div', {
        class: 'ux-toast-progress',
        role: 'progressbar',
        'aria-label': label,
        style: {
          animationDuration: `${total}s`,
          background: `rgb(var(${BALKEN_FARBE[options.type]}))`,
        },
        // Wie ein Wegklicken: Der Zustand bleibt, die Meldung geht.
        onAnimationend: () => {
          dismissed = true
          close()
        },
      })
  }

  /*
   * Erst nach dem Aufbau der Komponente beobachten.
   *
   * `options.content` steht in den Quellen des Watchers und würde mit
   * `immediate` schon während `setup()` ausgeführt. Verweist der Text auf eine
   * Konstante, die weiter unten in der Datei steht, wirft das — und der
   * Aufrufer muss seine Deklarationen nach den Bedürfnissen dieses
   * Composables ordnen. Das ist eine Falle, die früher oder später jeder
   * hineintappt; ein Toast ein Bild später fällt dagegen niemandem auf.
   */
  onMounted(() => {
    watch(
      [active, options.content, options.seconds],
      ([isActive, text]) => {
        if (!isActive) {
          close()
          dismissed = false
          return
        }

        if (handle) {
          // Nur den Text nachziehen — ein neuer Toast für dieselbe Ursache
          // würde bei jedem Tastendruck erneut aufspringen. Der Zähler läuft
          // dabei weiter, sonst ließe er sich durch Tippen endlos verlängern.
          handle.content = text
          return
        }

        if (dismissed) return

        handle = notification.create({
          title: options.title,
          content: text,
          type: options.type,
          /*
           * Der Balken gehört hier herein und nicht in ein nachträgliches
           * `handle.meta`. Naive misst die Höhe der Meldung in einem
           * `nextTick` nach dem Einhängen und lässt sie von dort aufklappen;
           * wer das Objekt vorher anfasst, löst ein Neuzeichnen aus, die
           * Transition bricht ab, und die Meldung bleibt auf Höhe 0 stehen —
           * sichtbar erst ab der zweiten, die sich dann über die erste legt.
           */
          meta: progressBar(Math.round(options.seconds.value)),
          // Kein `duration`: Das Ausblenden hängt am Balken, und der lässt
          // sich in den Einstellungen abschalten.
          closable: true,
          onClose: () => {
            dismissed = true
            handle = null
          },
        })
      },
      { immediate: true },
    )
  })

  onUnmounted(close)
}
