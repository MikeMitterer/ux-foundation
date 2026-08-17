/**
 * Die Schatten-Stufen.
 *
 * Ein Dialog oder ein Toast ohne Schatten klebt auf der Seite und wird als
 * Teil des Inhalts gelesen statt als etwas darüber; der Rand allein trägt das
 * nicht, er ist in den meisten Paletten zu leise.
 *
 * Die Stufen stehen einmal für dunkle Flächen und werden für die hellen
 * überschrieben — schwarz auf Anthrazit ist fast nicht zu sehen, derselbe Wert
 * wirkt auf Papier zu kräftig. Genau diese zweite Liste ist die Stelle, die
 * beim nächsten hellen Theme vergessen wird: Der Schatten bliebe dann in der
 * dunklen Stärke stehen und legte einen schwarzen Rahmen aufs Papier.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { THEME_IDS, THEMES } from '@ux/index'

/*
 * Kommentare fliegen raus, bevor gesucht wird: Sonst zieht der Selektor-Griff
 * den ganzen Erklärblock davor mit, und `:root` steht nie für sich allein.
 */
const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
)

const STUFEN = ['--shadow-sm', '--shadow-lg'] as const

/** Alle Selektoren, unter denen ein Token gesetzt wird — samt Sammel-Selektoren. */
function selektorenMit(token: string): string[] {
  const treffer = [...tokensCss.matchAll(/([^{}]+)\{([^}]*)\}/g)]
  return treffer
    .filter((m) => new RegExp(`(?<![\\w-])${token}\\s*:`).test(m[2] ?? ''))
    .map((m) => (m[1] ?? '').trim())
}

/** Themes, für die ein Token ausdrücklich überschrieben wird. */
function themesMit(token: string): string[] {
  return selektorenMit(token)
    .flatMap((sel) => [...sel.matchAll(/\[data-theme='([\w-]+)'\]/g)].map((m) => m[1] ?? ''))
    .filter(Boolean)
}

describe('Schatten', () => {
  it('hat für jede Stufe einen Vorgabewert', () => {
    for (const stufe of STUFEN) {
      const roh = selektorenMit(stufe)
      expect(roh, `${stufe} steht nirgends`).not.toHaveLength(0)
      expect(roh, `${stufe} hat keinen Wert auf blankem :root`).toContain(':root')
    }
  })

  it('setzt für helle Themes eine eigene, schwächere Stufe', () => {
    const hell = THEME_IDS.filter((id) => !THEMES[id].isDark)
    expect(hell.length, 'ohne helles Theme prüft dieser Test nichts').toBeGreaterThan(0)

    for (const stufe of STUFEN) {
      const gesetzt = themesMit(stufe)
      for (const id of hell) {
        expect(gesetzt, `${id} fehlt bei ${stufe}`).toContain(id)
      }
    }
  })

  it('lässt dunkle Themes bei der Vorgabe', () => {
    // Eine eigene Stufe je dunklem Theme wäre dreizehnmal derselbe Wert —
    // und zwölf davon liefen beim ersten Feinschliff weg.
    const dunkel = THEME_IDS.filter((id) => THEMES[id].isDark)

    for (const stufe of STUFEN) {
      const gesetzt = themesMit(stufe)
      for (const id of dunkel) {
        expect(gesetzt, `${id} überschreibt ${stufe} ohne Not`).not.toContain(id)
      }
    }
  })

  it('macht den Dialog-Schatten kräftiger als den der Toasts', () => {
    // Zwei Stufen haben nur dann einen Sinn, wenn man sie unterscheidet.
    const werte = [...tokensCss.matchAll(/--shadow-(sm|lg):\s*([^;]+);/g)]
    const paare = werte.map((m) => ({ stufe: m[1], wert: (m[2] ?? '').trim() }))

    expect(paare.length).toBeGreaterThanOrEqual(4)
    for (const { stufe, wert } of paare) {
      // `lg` trägt zwei Lagen, `sm` eine — daran hängt der Unterschied.
      expect(wert.split('),').length, `${stufe}: ${wert}`).toBe(stufe === 'lg' ? 2 : 1)
    }
  })
})
