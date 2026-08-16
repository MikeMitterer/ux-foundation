/**
 * Tests für den Reiter-Zustand.
 *
 * Anlass war ein Fehler im Browser: Der Ref lag *in* der Funktion, also bekam
 * jeder Aufrufer seinen eigenen. Kopfzeile und Seite hielten damit zwei
 * unabhängige Zustände — der Klick änderte den einen, die Anzeige hing am
 * anderen, und erst ein Neuladen brachte beide zusammen. Der erste Test hält
 * genau das fest.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const TABS = ['themes', 'tokens', 'mobile'] as const

/**
 * Frisches Modul je Test.
 *
 * Der Zustand liegt bewusst auf Modulebene — genau deshalb muss er zwischen
 * den Tests zurückgesetzt werden. Über einen Query-Parameter am Importpfad
 * geht das nicht: esbuild liest ihn als Loader-Angabe und bricht ab.
 */
async function ladeModul() {
  vi.resetModules()
  return await import('../showcase/src/composables/useHashTab')
}

describe('useHashTab', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('teilt den Zustand über alle Aufrufer', async () => {
    const { useHashTab } = await ladeModul()

    const kopfzeile = useHashTab(TABS, 'themes')
    const seite = useHashTab(TABS, 'themes')

    kopfzeile.setTab('mobile')

    // Ohne geteilten Zustand stünde hier weiterhin 'themes' — das war der Fehler.
    expect(seite.active.value).toBe('mobile')
  })

  it('nimmt den Reiter aus der Adresse', async () => {
    window.location.hash = '#/tokens'
    const { useHashTab } = await ladeModul()
    expect(useHashTab(TABS, 'themes').active.value).toBe('tokens')
  })

  it('fällt bei unbekannter Adresse auf die Vorgabe zurück', async () => {
    window.location.hash = '#/gibtesnicht'
    const { useHashTab } = await ladeModul()
    expect(useHashTab(TABS, 'themes').active.value).toBe('themes')
  })
})
