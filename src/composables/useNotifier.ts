/**
 * Meldungen einer App — einheitlich als Toast, zustandsgebunden.
 *
 * Nimmt `useStateNotification` die Wiederholung ab: den Zugriff auf die
 * Naive-UI-API und die Anzeigedauer. Ohne das stünde in jeder Ansicht dieselbe
 * Verdrahtung, und eine davon wäre irgendwann anders.
 *
 * Der Unterschied zur App-Fassung, aus der das hier stammt: Die Anzeigedauer
 * wird **hereingegeben** statt aus einem Store gelesen. Das Fundament kennt
 * die Einstellungen einer App nicht und soll sie nicht kennen — welche Ref
 * geliefert wird, entscheidet die App.
 *
 * Was hier hineingehört: Aussagen über den **Zustand der Daten**. Was nicht:
 * Hinweise im Formular selbst. Eine Warnung zum Feld, in das man gerade tippt,
 * gehört neben das Feld und nicht in die Ecke des Fensters.
 */
import { useNotification } from 'naive-ui'
import type { Ref } from 'vue'

import { useStateNotification } from './useStateNotification'

export interface NotifyOptions {
  title: string
  content: () => string
  type: 'error' | 'warning' | 'info'
}

export interface Notifier {
  /**
   * Zeigt eine Meldung, solange `active` gilt.
   *
   * @param active  Zustand, der die Meldung auslöst.
   * @param options Titel, Text und Art.
   */
  notify: (active: Ref<boolean>, options: NotifyOptions) => void
}

/**
 * Liefert `notify` mit vorverdrahteter API und Anzeigedauer.
 *
 * Muss in `setup()` aufgerufen werden — `useNotification` braucht den
 * Komponenten-Kontext.
 *
 * @param seconds Sekunden bis zum Ausblenden; `0` lässt den Toast stehen.
 *                Als Ref, damit eine Änderung in den Einstellungen sofort greift.
 */
export function useNotifier(seconds: Ref<number>): Notifier {
  const notification = useNotification()

  return {
    notify(active, options) {
      useStateNotification(notification, active, { ...options, seconds })
    },
  }
}
