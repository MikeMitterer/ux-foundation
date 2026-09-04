/**
 * Bewacht die Speicher-Regel aus dem Skill `ux-standards`, Abschnitt „Speicher".
 *
 * Die Erkennung liegt im Paket (`@ux/testing`) und wird dort geprüft; hier
 * steht nur, was für **dieses** Repo gilt: welche Bäume durchsucht werden und
 * welche Datei zugreifen darf.
 */
import { describe, expect, it } from 'vitest'

import { findDirectAccess, findDirectAccessInFile } from '@ux/testing'

/** Die einzige Datei, die zugreifen darf — sie *ist* die Absicherung. */
const ALLOWED = 'src/composables/safeStorage.ts'

describe('Zugriff auf den Speicher', () => {
  it('läuft ausschließlich über `safeStorage`', () => {
    const offenders = findDirectAccess({
      name: 'localStorage',
      roots: ['src', 'showcase/src'],
      allow: [ALLOWED],
    })

    expect(offenders, `direkter Zugriff:\n${offenders.join('\n')}`).toEqual([])
  })

  it('sieht die Ausnahme wirklich an, statt sie nur zu behaupten', () => {
    // Ohne diesen Fall liefe der Test auch dann grün, wenn er gar nichts fände.
    expect(findDirectAccessInFile(ALLOWED, 'localStorage').length).toBeGreaterThan(0)
  })
})
