/**
 * Die Regelsätze aus `@ux/eslint`, geprüft am echten Linter.
 *
 * Geprüft wird das, was der Helfer erzeugt — nicht der Helfer selbst. Eine
 * Zusicherung über die zurückgegebene Datenstruktur wäre wertlos: Was zählt,
 * ist, ob ESLint damit findet und übersieht, was es soll.
 */
import { Linter } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import { noDirectGlobals, noDirectGlobalsInTemplates } from '@ux/eslint'

const STORAGE = { name: 'localStorage', message: 'Nutze safeStorage.' }
const FETCH = { name: 'fetch', message: 'Nutze den HTTP-Client.' }

const linter = new Linter()

/**
 * Lintet ein Stück TypeScript und liefert die Zahl der Verstöße.
 *
 * @param code  Der Quelltext.
 * @param rules Die zu prüfenden Regeln; Vorgabe ist die Speicher-Sperre.
 */
function lintScript(code: string, rules: Record<string, unknown> = noDirectGlobals([STORAGE])): number {
  const messages = linter.verify(
    code,
    [{ files: ['**/*.ts'], languageOptions: { parser: tseslint.parser }, rules }],
    'a.ts',
  )
  // Ein Parse-Fehler trägt keine Regel-Kennung und wäre ein falsches Grün.
  expect(messages.every((message) => message.ruleId !== null), messages[0]?.message).toBe(true)
  return messages.length
}

/**
 * Lintet eine SFC — Skriptblock über die Kernregeln, Template über die
 * Vue-Regel.
 *
 * @param code Der Inhalt der `.vue`-Datei.
 */
function lintSfc(code: string): number {
  const messages = linter.verify(
    code,
    [
      ...pluginVue.configs['flat/base'],
      {
        files: ['**/*.vue'],
        languageOptions: { parserOptions: { parser: tseslint.parser } },
        rules: { ...noDirectGlobals([STORAGE]), ...noDirectGlobalsInTemplates([STORAGE]) },
      },
    ],
    'a.vue',
  )
  expect(messages.every((message) => message.ruleId !== null), messages[0]?.message).toBe(true)
  return messages.length
}

describe('Direkter Zugriff wird gefunden', () => {
  it.each([
    ['nackter Name', 'localStorage.getItem("k")'],
    ['Punktnotation', 'const a = window.localStorage'],
    ['Klammernotation', "const a = window['localStorage']"],
    ['Destrukturierung', 'const { localStorage } = window'],
    ['globalThis', 'const a = globalThis.localStorage'],
    ['Reflect.get am Wirtsobjekt', "Reflect.get(window, 'localStorage')"],
    ['Reflect.deleteProperty', "Reflect.deleteProperty(window, 'localStorage')"],
    ['Object.getOwnPropertyDescriptor', "Object.getOwnPropertyDescriptor(window, 'localStorage')"],
  ])('%s', (_label, code) => {
    expect(lintScript(code)).toBeGreaterThan(0)
  })
})

describe('Was kein Zugriff ist, bleibt unbehelligt', () => {
  it.each([
    ['eine Zeichenkette', "const name = 'localStorage'"],
    ['ein Objektschlüssel', 'const o = { localStorage: false }'],
    ['ein Kommentar', '/* window.localStorage darf hier stehen */ const a = 1'],
    ['ein reiner Typknoten', 'interface Options { localStorage: boolean }'],
    ['eine Typannotation', 'let a: { localStorage: string }'],
  ])('%s', (_label, code) => {
    expect(lintScript(code)).toBe(0)
  })

  it('ein überdeckter Name — das kann nur die Sichtbarkeitsanalyse', () => {
    // Hier ist `localStorage` ein Parameter und meint nicht den globalen.
    expect(lintScript('function load(localStorage: Storage) { return localStorage.getItem("k") }')).toBe(0)
  })

  it.each([
    ['Reflect an einem lokalen Wert', "Reflect.get(config, 'localStorage')"],
    ['Object an einem lokalen Wert', "Object.defineProperty(config, 'localStorage', {})"],
    ['ein anderer Eigenschaftsname', "Reflect.get(window, 'sessionStorage')"],
  ])('%s', (_label, code) => {
    // Der Selektor prüft beide Argumentpositionen: Wirtsobjekt **und**
    // Zeichenkette. Ohne die erste Bedingung schlüge jeder `Reflect`-Aufruf an.
    expect(lintScript(code)).toBe(0)
  })
})

describe('Eine SFC wird ganz gelesen', () => {
  it('findet den Zugriff im Skriptblock', () => {
    expect(lintSfc('<script setup lang="ts">const a = window.localStorage</script>')).toBeGreaterThan(0)
  })

  it('findet den Zugriff im Template — dort steht kein Skript', () => {
    expect(
      lintSfc('<template><button @click="window.localStorage.clear()">x</button></template>'),
    ).toBeGreaterThan(0)
  })

  it('findet auch die Klammernotation im Template', () => {
    expect(
      lintSfc(`<template><button @click="window['localStorage'].clear()">x</button></template>`),
    ).toBeGreaterThan(0)
  })

  it('lässt sichtbaren Text und statische Attribute in Ruhe', () => {
    expect(lintSfc('<template><p title="localStorage">localStorage ist ein Wort</p></template>')).toBe(0)
  })

  it('lässt `Reflect` an einem lokalen Wert auch im Template in Ruhe', () => {
    expect(lintSfc(`<template><button @click="Reflect.get(config, 'localStorage')">x</button></template>`)).toBe(0)
  })
})

describe('Mehrere Sperren gehören in einen Aufruf', () => {
  it('verliert keine, wenn sie zusammen übergeben werden', () => {
    const rules = noDirectGlobals([STORAGE, FETCH])

    expect(lintScript('const a = window.localStorage', rules)).toBeGreaterThan(0)
    expect(lintScript('await fetch(url)', rules)).toBeGreaterThan(0)
  })

  it('trifft nur die Namen, die gefragt sind', () => {
    const rules = noDirectGlobals([FETCH])

    expect(lintScript('const a = window.localStorage', rules)).toBe(0)
  })

  it('nimmt ein eigenes Wirtsobjekt entgegen', () => {
    const rules = noDirectGlobals([{ ...STORAGE, via: ['host'] }])

    expect(lintScript('const a = host.localStorage', rules)).toBeGreaterThan(0)
  })
})
