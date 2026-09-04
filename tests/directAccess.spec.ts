/**
 * Die Erkennung des Wächters aus `@ux/testing`.
 *
 * Geprüft wird über die **öffentliche** Schnittstelle — die Fälle laufen durch
 * echte Dateien in einem temporären Verzeichnis, nicht an ihr vorbei über
 * interne Funktionen. Was hier grün ist, gilt damit auch für eine einbindende
 * App.
 *
 * Jeder Fall unten stammt aus einer nachgewiesenen Umgehung; die Herkunft steht
 * im Ticket T-18 und im Inventar in `CLAUDE-REVIEW-PATTERNS.md`.
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { findDirectAccess } from '@ux/testing'

const created: string[] = []

afterEach(() => {
  created.splice(0).forEach((dir) => rmSync(dir, { recursive: true, force: true }))
})

/**
 * Legt die Dateien an und lässt den Wächter darüber laufen.
 *
 * @param files Dateiname auf Inhalt.
 * @param name  Der gesuchte Name; Vorgabe `localStorage`.
 */
function scan(files: Record<string, string>, name = 'localStorage'): string[] {
  const dir = mkdtempSync(join(tmpdir(), 'ux-guard-'))
  created.push(dir)

  for (const [file, content] of Object.entries(files)) {
    const path = join(dir, file)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content, 'utf-8')
  }

  return findDirectAccess({ name, roots: ['.'], root: dir })
}

describe('Der Wächter unterscheidet Code von Text', () => {
  it('findet den geraden Zugriff und nennt die Zeile', () => {
    const found = scan({
      'a.ts': ['const eins = 1', 'const stored = window.localStorage'].join('\n'),
    })

    expect(found).toEqual(['a.ts:2 → const stored = window.localStorage'])
  })

  it('findet einen Zugriff zwischen zwei Strings, die wie Kommentarmarken aussehen', () => {
    const found = scan({
      'a.ts': [
        "const markerStart = '/*'",
        'const forbidden = window.localStorage',
        "const markerEnd = '*/'",
      ].join('\n'),
    })

    expect(found).toEqual(['a.ts:2 → const forbidden = window.localStorage'])
  })

  it('meldet Zeichenkette, Kommentar und Template-Literal nicht', () => {
    const found = scan({
      'a.ts': [
        "const storageApiName = 'localStorage'",
        '/* window.localStorage darf hier stehen */',
        'const hint = `nutze localStorage nicht`',
      ].join('\n'),
    })

    expect(found).toEqual([])
  })

  it('erfasst Klammerzugriff, Destrukturierung und berechneten Namen', () => {
    const found = scan({
      'a.ts': [
        'const { localStorage } = window',
        "const a = window['localStorage']",
        'const b = window[`localStorage`]',
        "const { ['localStorage']: c } = window",
      ].join('\n'),
    })

    expect(found.map((entry) => entry.split(' → ')[0])).toEqual([
      'a.ts:1',
      'a.ts:2',
      'a.ts:3',
      'a.ts:4',
    ])
  })

  it('erfasst `Reflect.get`, aber kein beliebiges Funktionsargument', () => {
    const found = scan({
      'a.ts': [
        "const stored = Reflect.get(window, 'localStorage')",
        "describe('localStorage', () => {})",
      ].join('\n'),
    })

    expect(found).toEqual([
      "a.ts:1 → const stored = Reflect.get(window, 'localStorage')",
    ])
  })

  it('liest in einer SFC den Skriptblock mit der Zeile der Datei', () => {
    const found = scan({
      'a.vue': [
        '<template>',
        '  <p>Text</p>',
        '</template>',
        '',
        '<script setup lang="ts">',
        'const x = window.localStorage',
        '</script>',
      ].join('\n'),
    })

    expect(found).toEqual(['a.vue:6 → const x = window.localStorage'])
  })

  it('liest auch das Template — ganz ohne Skriptblock', () => {
    const found = scan({
      'a.vue': [
        '<template>',
        '  <button @click="$event.view.localStorage.clear()">Weg</button>',
        '</template>',
      ].join('\n'),
    })

    expect(found).toEqual(['a.vue:2 → $event.view.localStorage.clear()'])
  })

  it('lässt sichtbaren Text und statische Attribute im Template in Ruhe', () => {
    const found = scan({
      'a.vue': [
        '<template>',
        '  <p title="localStorage">localStorage ist hier nur ein Wort</p>',
        '</template>',
      ].join('\n'),
    })

    expect(found).toEqual([])
  })

  it('überspringt die erlaubten Dateien', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ux-guard-'))
    created.push(dir)
    writeFileSync(join(dir, 'erlaubt.ts'), 'const a = window.localStorage', 'utf-8')
    writeFileSync(join(dir, 'verboten.ts'), 'const b = window.localStorage', 'utf-8')

    const found = findDirectAccess({
      name: 'localStorage',
      roots: ['.'],
      root: dir,
      allow: ['erlaubt.ts'],
    })

    expect(found).toEqual(['verboten.ts:1 → const b = window.localStorage'])
  })

  it('sucht den Namen, der gefragt ist — nicht ausgerechnet den Speicher', () => {
    // Dasselbe Gerüst trägt „kein direktes `fetch`" oder „kein `useI18n()`".
    const found = scan({ 'a.ts': 'await fetch(url)' }, 'fetch')

    expect(found).toEqual(['a.ts:1 → await fetch(url)'])
  })
})
