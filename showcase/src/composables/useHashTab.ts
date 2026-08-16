/**
 * Aktiver Reiter, über die Adresse ansteuerbar.
 *
 * Der Skill verlangt das für Reiter-Seiten: Nur so kann ein Hinweis irgendwo
 * auf den passenden Reiter verweisen, statt „steht irgendwo in den
 * Einstellungen" zu sagen. Hier hat es denselben Nutzen — ein Link auf
 * `#/komponenten` führt direkt dorthin.
 *
 * Bewusst ohne vue-router: Die App hat eine Seite. Ein Router dafür wäre eine
 * Ebene zwischen Leser und Sache.
 */
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

export function useHashTab<T extends string>(
  tabs: readonly T[],
  fallback: T,
): { active: Ref<T>; setTab: (tab: T) => void } {
  /** Liest den Reiter aus der Adresse; Unbekanntes fällt auf die Vorgabe. */
  function fromHash(): T {
    const raw = window.location.hash.replace(/^#\/?/, '')
    return (tabs as readonly string[]).includes(raw) ? (raw as T) : fallback
  }

  const active = ref(fromHash()) as Ref<T>

  function onHashChange(): void {
    active.value = fromHash()
  }

  onMounted(() => window.addEventListener('hashchange', onHashChange))
  onUnmounted(() => window.removeEventListener('hashchange', onHashChange))

  // Die Adresse normalisieren: Wer `#` oder Unsinn eingibt, landet auf der
  // Vorgabe — und sieht das dann auch in der Adresszeile.
  watch(
    active,
    (tab) => {
      const target = `#/${tab}`
      if (window.location.hash !== target) window.history.replaceState(null, '', target)
    },
    { immediate: true },
  )

  return {
    active,
    setTab: (tab: T): void => {
      active.value = tab
    },
  }
}
