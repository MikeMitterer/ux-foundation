/**
 * Wächter für die Lage der Toasts.
 *
 * Naive UI setzt Meldungen von sich aus 12 Pixel unter den oberen Rand — also
 * über die klebende Kopfzeile. Der Fehler ist zweimal aufgetreten, in
 * StockInfo („Aktualisieren" lag unter einem Fehler-Toast) und im Schaufenster
 * (der Theme-Umschalter). Beim zweiten Mal ist der Versatz ins Paket gezogen;
 * diese Tests halten ihn dort.
 *
 * Geprüft wird nicht die gerenderte Höhe: Der Container hängt am `body`, die
 * Zahl steckt in einer CSS-Variablen, und `happy-dom` rechnet `calc()` mit
 * `rem` nicht aus. Geprüft wird deshalb die Kette — Provider reicht die
 * Variable durch, die Variable steht in den Token, und niemand rechnet sie
 * daneben noch einmal von Hand nach.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { UxNotificationProvider } from '@ux/index'

const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')
const topbarVue = readFileSync(resolve(process.cwd(), 'src/components/UxTopbar.vue'), 'utf8')

/** Beide Bäume: das Paket selbst und das Schaufenster. */
const BAEUME = [resolve(process.cwd(), 'src'), resolve(process.cwd(), 'showcase/src')]

/** Alle `.vue`-Dateien unter einem Baum, rekursiv. */
function vueFiles(dir?: string): string[] {
  if (dir === undefined) return BAEUME.flatMap((baum) => vueFiles(baum))
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return vueFiles(path)
    return entry.name.endsWith('.vue') ? [path] : []
  })
}

describe('Token für die Lage der Toasts', () => {
  it('kennt die Höhe der Kopfzeile', () => {
    expect(tokensCss).toMatch(/--topbar-height:\s*3\.5rem;/)
  })

  it('leitet die Oberkante der Toasts daraus ab', () => {
    // Nicht als ausgerechnete Zahl: Sonst wandert die eine und die andere
    // bleibt stehen — genau der Fehler, den dieser Test verhindern soll.
    expect(tokensCss).toMatch(/--toast-top:\s*calc\(var\(--topbar-height\)/)
  })

  it('weicht den Bedienelementen aus, nicht der ganzen Leiste', () => {
    /*
     * Gemessen im Browser: Die Leiste ist 56 Pixel hoch und zentriert ihren
     * Inhalt, Menüpunkte und rechte Gruppe enden bei 44. Die Meldung muss
     * darunter beginnen — erst unterhalb der ganzen Leiste zu starten
     * verschenkt den leeren Streifen ohne Gewinn.
     *
     * Gerechnet wird auf die **Meldung**, nicht auf den Container: Naive legt
     * auf dessen Oberkante noch einmal 12 Pixel eigenen Abstand.
     */
    const BAR_PX = 56
    const BEDIENELEMENTE_UNTERKANTE_PX = 44
    const NAIVE_ABSTAND_PX = 12

    const treffer = tokensCss.match(
      /--toast-top:\s*calc\(var\(--topbar-height\)\s*([+-])\s*([\d.]+)rem\)/,
    )
    expect(treffer, 'Die Ableitung sieht anders aus als erwartet').not.toBeNull()

    const [, zeichen, betrag] = treffer as RegExpMatchArray
    const meldungTopPx =
      BAR_PX + (zeichen === '-' ? -1 : 1) * Number(betrag) * 16 + NAIVE_ABSTAND_PX

    expect(meldungTopPx, 'liegt über den Bedienelementen').toBeGreaterThan(
      BEDIENELEMENTE_UNTERKANTE_PX,
    )
    expect(meldungTopPx, 'verschenkt den leeren Streifen der Leiste').toBeLessThanOrEqual(BAR_PX)
  })

  it('lässt die Kopfzeile ihre eigene Höhe aus dem Token nehmen', () => {
    expect(topbarVue).toMatch(/height:\s*var\(--topbar-height\)/)
    expect(topbarVue, 'Die Höhe steht wieder als Zahl in der Komponente').not.toMatch(
      /height:\s*3\.5rem/,
    )
  })
})

describe('UxNotificationProvider', () => {
  it('reicht die Oberkante als Variable durch', () => {
    const wrapper = mount(UxNotificationProvider, {
      slots: { default: '<p>Inhalt</p>' },
    })

    const provider = wrapper.findComponent({ name: 'NotificationProvider' })
    expect(provider.props('containerStyle')).toEqual({ top: 'var(--toast-top)' })
  })

  it('begrenzt den Stapel, ohne die Wahl zu nehmen', () => {
    // Drei ist die Vorgabe: Fallen mehrere Quellen gleichzeitig aus, soll
    // daraus keine Lawine werden, die den halben Bildschirm deckt.
    const vorgabe = mount(UxNotificationProvider)
    expect(vorgabe.findComponent({ name: 'NotificationProvider' }).props('max')).toBe(3)

    const eigen = mount(UxNotificationProvider, { props: { max: 1 } })
    expect(eigen.findComponent({ name: 'NotificationProvider' }).props('max')).toBe(1)
  })

  it('gibt den Inhalt weiter', () => {
    const wrapper = mount(UxNotificationProvider, { slots: { default: '<p>Inhalt</p>' } })

    expect(wrapper.text()).toContain('Inhalt')
  })
})

describe('Der Versatz wird nirgends nachgerechnet', () => {
  it('kommt aus dem Provider, nicht aus einer App', () => {
    const eigene = vueFiles()
      .filter((pfad) => !pfad.endsWith('UxNotificationProvider.vue'))
      .filter((pfad) => /container-style|containerStyle/.test(readFileSync(pfad, 'utf8')))
      .map((pfad) => relative(process.cwd(), pfad))

    expect(
      eigene,
      `Eigener \`container-style\` statt UxNotificationProvider:\n${eigene.join('\n')}`,
    ).toEqual([])
  })

  it('findet den Provider überhaupt — sonst prüft der Wächter nichts', () => {
    const nutzer = vueFiles().filter((pfad) =>
      /<UxNotificationProvider/.test(readFileSync(pfad, 'utf8')),
    )

    expect(nutzer.length).toBeGreaterThan(0)
  })
})
