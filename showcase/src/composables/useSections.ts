/**
 * Die Gliederung des Schaufensters: Bereiche oben, Abschnitte darin.
 *
 * Warum nicht acht Menüpunkte: Der Richtwert liegt bei drei bis fünf. Wird es
 * mehr, ist meistens etwas dabei, das dort nicht hingehört — hier sind es
 * Kapitel einer Seite und keine Arbeitsbereiche. Drei Bereiche mit Reitern
 * darin ist die Form, die der Skill für so etwas vorsieht.
 *
 * Eine Quelle für beides: Welcher Bereich aktiv ist, leitet sich aus dem
 * aktiven Abschnitt ab. Zwei getrennte Zustände liefen früher oder später
 * auseinander.
 */
import { computed, type ComputedRef, type Ref } from 'vue'

import type { NavIconName } from '@ux/index'

import { useHashTab } from './useHashTab'

export const SECTION_IDS = [
  'themes',
  'tokens',
  'scales',
  'typography',
  'icons',
  'components',
  'own',
  'mobile',
  'patterns',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export interface Area {
  id: 'basics' | 'components' | 'behaviour'
  /**
   * Symbol aus dem Fundament.
   *
   * Ausgeliehen: Die vier Symbole stehen für Übersicht, Ausgleichen, Papiere
   * und Einstellungen — Rollen, die es in einer Schaufenster-App nicht gibt.
   * Ein fünftes zu erfinden wäre genau der Wildwuchs, den das Paket verhindern
   * soll, deshalb lieber geliehen als neu gezeichnet.
   */
  icon: NavIconName
  sections: readonly SectionId[]
}

export const AREAS: readonly Area[] = [
  { id: 'basics', icon: 'dashboard', sections: ['themes', 'tokens', 'scales', 'typography', 'icons'] },
  { id: 'components', icon: 'instruments', sections: ['components', 'own'] },
  { id: 'behaviour', icon: 'settings', sections: ['mobile', 'patterns'] },
] as const

export function useSections(): {
  section: Ref<SectionId>
  setSection: (id: SectionId) => void
  activeArea: ComputedRef<Area['id']>
  openArea: (area: Area) => void
} {
  const { active: section, setTab: setSection } = useHashTab(SECTION_IDS, 'themes')

  const activeArea = computed<Area['id']>(
    () => AREAS.find((area) => area.sections.includes(section.value))?.id ?? 'basics',
  )

  /** Ein Klick auf den Bereich führt auf dessen ersten Abschnitt. */
  function openArea(area: Area): void {
    setSection(area.sections[0])
  }

  return { section, setSection, activeArea, openArea }
}
