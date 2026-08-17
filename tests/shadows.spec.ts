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

/** Die haarfeine helle Linie, die auf dunklem Grund die Kante behauptet. */
const HELLE_KANTE = /rgb\(\s*255\s+255\s+255\s*\/\s*[\d.]+\s*\)/

/** Blanke Vorgabe — sie gilt für die dunklen Themes. */
const istVorgabe = (sel: string): boolean => sel === ':root'

/** Der Sammel-Selektor der hellen Themes. */
const istHell = (sel: string): boolean => sel.includes('[data-theme=')

/** Wert einer Stufe unter dem ersten Selektor, auf den `passt` zutrifft. */
function wertUnter(stufe: string, passt: (sel: string) => boolean): string {
  const muster = new RegExp(`(?<![\\w-])${stufe}\\s*:\\s*([^;]+);`)
  for (const block of tokensCss.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (!passt((block[1] ?? '').trim())) continue
    const treffer = muster.exec(block[2] ?? '')
    if (treffer) return (treffer[1] ?? '').trim()
  }
  return ''
}

/** Die höchste Deckkraft unter den schwarzen Lagen — sie macht die Tiefe aus. */
function dunkelsteLage(wert: string): number {
  const lagen = [...wert.matchAll(/rgb\(\s*0\s+0\s+0\s*\/\s*([\d.]+)\s*\)/g)].map((m) =>
    Number(m[1]),
  )
  return lagen.length === 0 ? 0 : Math.max(...lagen)
}

/** Die Deckkraft der hellen Kante — auf dunklem Grund die tragende Lage. */
function kantenStaerke(wert: string): number {
  const treffer = /rgb\(\s*255\s+255\s+255\s*\/\s*([\d.]+)\s*\)/.exec(wert)
  return treffer ? Number(treffer[1]) : 0
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
    // Eine eigene Stufe je dunklem Theme wäre derselbe Wert, so oft es dunkle
    // Themes gibt — und fast alle liefen beim ersten Feinschliff weg.
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
    // Gemessen wird die kräftigste dunkle Lage — nicht die Zahl der Lagen:
    // Seit die dunklen Themes eine helle Kante voranstellen, zählt die nichts
    // mehr über die Tiefe aus.
    for (const passt of [istVorgabe, istHell]) {
      const sm = dunkelsteLage(wertUnter('--shadow-sm', passt))
      const lg = dunkelsteLage(wertUnter('--shadow-lg', passt))
      expect(lg, `lg (${lg}) muss über sm (${sm}) liegen`).toBeGreaterThan(sm)
    }
  })

  it('trennt die Stufen auch dort, wo das Schwarz nichts austrägt', () => {
    // Auf dunklem Grund ist die Kante der einzige sichtbare Unterschied
    // zwischen „schwebt knapp" und „liegt deutlich darüber". Wären beide gleich
    // stark, sähen Toast und Dialog dort gleich aus — und die zweite Stufe
    // stünde ohne Wirkung in der Datei.
    const sm = kantenStaerke(wertUnter('--shadow-sm', istVorgabe))
    const lg = kantenStaerke(wertUnter('--shadow-lg', istVorgabe))

    expect(sm, 'sm ohne helle Kante').toBeGreaterThan(0)
    expect(lg, `lg (${lg}) muss eine kräftigere Kante tragen als sm (${sm})`).toBeGreaterThan(sm)
  })

  /*
   * Der eigentliche Fehler, den dieser Block bewacht: Auf dunklem Grund war der
   * Schatten unsichtbar, und zwar nicht wegen eines zu kleinen Werts. Ein
   * Schatten kann nur abdunkeln — bei einer nahezu schwarzen Seitenfläche ist
   * dort kein Spielraum. Selbst vollständig deckendes Schwarz kam auf 1.05 bis
   * 1.23, während die hellen Themes 1.31 erreichen. Die helle Kante dreht das
   * Vorzeichen um und ist damit kein Feinschliff, sondern das tragende Mittel.
   */
  it('legt auf dunklem Grund eine helle Kante an', () => {
    for (const stufe of STUFEN) {
      const wert = wertUnter(stufe, istVorgabe)
      expect(wert, `${stufe} steht nicht auf blankem :root`).not.toBe('')
      expect(HELLE_KANTE.test(wert), `${stufe} ohne helle Kante: ${wert}`).toBe(true)
    }
  })

  it('verzichtet auf hellem Grund auf die Kante', () => {
    // Weiß auf Weiß ist nichts — dort trägt der Schatten von allein, und eine
    // Kante wäre eine Lage, die nur im Bündel steht.
    for (const stufe of STUFEN) {
      const wert = wertUnter(stufe, istHell)
      expect(wert, `${stufe} hat keine helle Fassung`).not.toBe('')
      expect(HELLE_KANTE.test(wert), `${stufe} trägt eine Kante ohne Wirkung: ${wert}`).toBe(false)
    }
  })
})
