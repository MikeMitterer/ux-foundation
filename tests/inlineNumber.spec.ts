/**
 * Tests für UxInlineNumber — die Zahl, die direkt in der Tabellenzeile
 * editierbar ist.
 *
 * Der Auslöser für diese Tests: `<input type="number">` lässt Vues `v-model`
 * den Wert selbsttätig in eine **Zahl** umwandeln. Der ursprüngliche Code rief
 * `.replace()` darauf auf, warf eine TypeError und verschluckte damit jede
 * Eingabe — die Zelle sprang kommentarlos auf den alten Wert zurück.
 */

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UxInlineNumber from '@ux/components/UxInlineNumber.vue'

/** Öffnet den Editor und liefert das Eingabefeld. */
async function openEditor(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('button').trigger('click')
  return wrapper.find('input')
}

/*
 * Die Beschriftungen kommen als Prop herein — ein Paket hat keinen Katalog.
 * Hier stehen sie als Konstante, damit der Test sie wiedererkennt.
 */
const LABEL_EDIT = 'Bearbeiten'
const LABEL_CLEAR = 'Leeren'

function makeWrapper(props: Record<string, unknown> = {}) {
  return mount(UxInlineNumber, {
    props: {
      value: 10,
      display: '10,0 %',
      min: 0,
      max: 100,
      editLabel: LABEL_EDIT,
      clearLabel: LABEL_CLEAR,
      ...props,
    },
  })
}

describe('UxInlineNumber — Anzeige', () => {
  it('zeigt im Ruhezustand den formatierten Text', () => {
    /*
     * Gezielt auf die Anzeige und nicht auf `.text()` der ganzen Komponente:
     * Der Breiten-Platzhalter trägt denselben Text ein zweites Mal, damit die
     * Spalte beim Wechsel in den Eingabemodus nicht springt. Für Hilfstechnik
     * ist er unsichtbar (`aria-hidden`), für `.text()` nicht.
     */
    expect(makeWrapper().get('.inline-number__display').text()).toBe('10,0 %')
  })

  it('hält die Breite mit einem Platzhalter, der für Hilfstechnik unsichtbar ist', () => {
    const sizer = makeWrapper().get('.inline-number__sizer')
    expect(sizer.attributes('aria-hidden')).toBe('true')
    expect(sizer.text()).toBe('10,0 %')
  })

  it('zeigt kein Eingabefeld, solange nicht editiert wird', () => {
    expect(makeWrapper().find('input').exists()).toBe(false)
  })

  it('öffnet bei Klick ein Eingabefeld mit dem Rohwert', async () => {
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('10')
  })

  it('öffnet nichts, wenn deaktiviert', async () => {
    const wrapper = makeWrapper({ disabled: true })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('input').exists()).toBe(false)
  })
})

describe('UxInlineNumber — Übernehmen', () => {
  it('meldet den neuen Wert beim Verlassen des Feldes', async () => {
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue('42')
    await input.trigger('blur')

    expect(wrapper.emitted('commit')?.[0]).toEqual([42])
  })

  it('meldet den neuen Wert bei Enter', async () => {
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue('42')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('commit')?.[0]).toEqual([42])
  })

  it('verkraftet einen Zahlwert aus v-model ohne zu werfen', async () => {
    // Der eigentliche Fehlerfall: type="number" liefert eine Zahl, keinen String.
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue(42)
    await input.trigger('blur')

    expect(wrapper.emitted('commit')?.[0]).toEqual([42])
  })

  it('übernimmt Nachkommastellen', async () => {
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue('12.5')
    await input.trigger('blur')

    expect(wrapper.emitted('commit')?.[0]).toEqual([12.5])
  })

  it('schließt das Feld nach dem Übernehmen', async () => {
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)
    await input.setValue('42')
    await input.trigger('blur')

    expect(wrapper.find('input').exists()).toBe(false)
  })
})

describe('UxInlineNumber — Grenzen und Sonderfälle', () => {
  it('meldet nichts, wenn der Wert unverändert bleibt', async () => {
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue('10')
    await input.trigger('blur')

    expect(wrapper.emitted('commit')).toBeUndefined()
  })

  it('deckelt nach oben auf max', async () => {
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue('150')
    await input.trigger('blur')

    expect(wrapper.emitted('commit')?.[0]).toEqual([100])
  })

  it('deckelt nach unten auf min', async () => {
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue('-20')
    await input.trigger('blur')

    expect(wrapper.emitted('commit')?.[0]).toEqual([0])
  })

  it('verwirft die Eingabe bei Escape', async () => {
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue('42')
    await input.trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('commit')).toBeUndefined()
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('meldet nichts bei unlesbarer Eingabe', async () => {
    // Ein `type="number"`-Feld verwirft solchen Text und liefert einen leeren
    // Wert — der darf nicht als 0 durchgehen.
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue('keine Zahl')
    await input.trigger('blur')

    expect(wrapper.emitted('commit')).toBeUndefined()
  })

  it('setzt den Wert nicht auf 0, wenn das Feld geleert wird', async () => {
    // Ohne `emptyValue` bedeutet Leere nichts — der Bestand bleibt stehen.
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue('')
    await input.trigger('blur')

    expect(wrapper.emitted('commit')).toBeUndefined()
  })

  it('übernimmt bei gesetztem emptyValue den Ersatzwert für ein leeres Feld', async () => {
    // In der Kauf/Verkauf-Spalte heißt leer „kein Trade" — dort erst „0"
    // tippen zu müssen, um etwas zu löschen, war eine Schikane.
    const wrapper = makeWrapper({ value: 500, min: -1000, emptyValue: 0 })
    const input = await openEditor(wrapper)

    await input.setValue('')
    await input.trigger('blur')

    expect(wrapper.emitted('commit')).toEqual([[0]])
  })

  it('gilt auch für Enter, nicht nur fürs Wegklicken', async () => {
    const wrapper = makeWrapper({ value: 500, min: -1000, emptyValue: 0 })
    const input = await openEditor(wrapper)

    await input.setValue('')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('commit')).toEqual([[0]])
  })

  it('meldet nichts, wenn der Ersatzwert schon dasteht', async () => {
    const wrapper = makeWrapper({ value: 0, min: -1000, emptyValue: 0 })
    const input = await openEditor(wrapper)

    await input.setValue('')
    await input.trigger('blur')

    expect(wrapper.emitted('commit')).toBeUndefined()
  })

  it('meldet nur einmal, wenn nach Enter noch ein blur folgt', async () => {
    const wrapper = makeWrapper()
    const input = await openEditor(wrapper)

    await input.setValue('42')
    await input.trigger('keydown', { key: 'Enter' })
    await input.trigger('blur')

    expect(wrapper.emitted('commit')).toHaveLength(1)
  })
})

describe('UxInlineNumber — Löschkreuz', () => {
  /**
   * Das Löschkreuz.
   *
   * Gesucht wird über die Übersetzung, nicht über den deutschen Text: Die
   * Vorgabesprache ist Englisch, und ein Test, der an einer Sprache klebt,
   * bricht beim nächsten Wechsel.
   */
  const clearButton = (wrapper: ReturnType<typeof mount>) =>
    wrapper
      .findAll('button')
      .find((button) => button.attributes('aria-label') === LABEL_CLEAR)

  it('zeigt kein Kreuz, wo Leere nichts bedeutet', () => {
    // Ohne `emptyValue` gäbe es nichts, worauf zurückgesetzt werden könnte.
    expect(clearButton(makeWrapper())).toBeUndefined()
  })

  it('zeigt ein Kreuz, sobald ein Wert drinsteht', () => {
    expect(clearButton(makeWrapper({ value: 42, emptyValue: 0 }))).toBeDefined()
  })

  it('zeigt kein Kreuz, wenn der Wert schon leer ist', () => {
    expect(clearButton(makeWrapper({ value: 0, emptyValue: 0 }))).toBeUndefined()
  })

  it('zeigt kein Kreuz bei deaktivierter Zelle', () => {
    expect(clearButton(makeWrapper({ value: 42, emptyValue: 0, disabled: true }))).toBeUndefined()
  })

  it('setzt beim Klick auf den Leerwert zurück', async () => {
    const wrapper = makeWrapper({ value: 42, min: -100, emptyValue: 0 })
    await clearButton(wrapper)?.trigger('click')

    expect(wrapper.emitted('commit')).toEqual([[0]])
  })

  it('öffnet dabei keinen Editor', async () => {
    const wrapper = makeWrapper({ value: 42, min: -100, emptyValue: 0 })
    await clearButton(wrapper)?.trigger('click')

    expect(wrapper.find('input').exists()).toBe(false)
  })
})
