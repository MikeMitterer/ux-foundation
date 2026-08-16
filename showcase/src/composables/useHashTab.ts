/**
 * Aktiver Reiter, über die Adresse ansteuerbar.
 *
 * Der Skill verlangt das für Reiter-Seiten: Nur so kann ein Hinweis irgendwo
 * auf den passenden Reiter verweisen, statt „steht irgendwo in den
 * Einstellungen" zu sagen. Hier hat es denselben Nutzen — ein Link auf
 * `#/components` führt direkt dorthin.
 *
 * Bewusst ohne vue-router: Die App hat eine Seite. Ein Router dafür wäre eine
 * Ebene zwischen Leser und Sache.
 *
 * **Der Zustand liegt auf Modulebene und nicht in der Funktion.** Das ist der
 * ganze Punkt und war einmal anders — mit einem Ref *in* der Funktion bekommt
 * jeder Aufrufer seinen eigenen. Kopfzeile und Seite hatten dann zwei
 * unabhängige Zustände: Der Klick änderte den einen, die Anzeige hing am
 * anderen, und erst ein Neuladen brachte beide auf denselben Stand. `useTheme`
 * macht es seit jeher richtig; hier war es ein Versehen.
 */
import { ref, watch, type Ref } from 'vue'

interface HashTab<T extends string> {
  active: Ref<T>
  setTab: (tab: T) => void
}

/*
 * Einmal erzeugt, von allen geteilt.
 *
 * `unknown` als Zwischentyp, weil der geteilte Zustand naturgemäß nicht weiß,
 * mit welchen Reitern der erste Aufrufer ihn angelegt hat. Die App ruft ihn
 * mit genau einer Liste auf — das prüft der Test.
 */
let geteilt: unknown = null

function erzeugen<T extends string>(tabs: readonly T[], fallback: T): HashTab<T> {
  /** Liest den Reiter aus der Adresse; Unbekanntes fällt auf die Vorgabe. */
  const ausAdresse = (): T => {
    const roh = window.location.hash.replace(/^#\/?/, '')
    return (tabs as readonly string[]).includes(roh) ? (roh as T) : fallback
  }

  const active = ref(ausAdresse()) as Ref<T>

  /*
   * Ein Zuhörer fürs ganze Dokument, nicht je Komponente: Er lebt so lange wie
   * die Seite. Über `onMounted` registriert bräuchte er einen Komponenten-
   * Kontext, den es hier nicht gibt.
   */
  window.addEventListener('hashchange', () => {
    active.value = ausAdresse()
  })

  /*
   * Die Adresse wird über `location.hash` gesetzt und **nicht** über
   * `history.replaceState`: Letzteres löst kein `hashchange` aus. Solange die
   * Seite ihren Zustand aus derselben Quelle liest, fällt das nicht auf —
   * sobald ein zweiter Leser dazukommt, erfährt der nie etwas.
   *
   * Nebeneffekt in die richtige Richtung: So entsteht ein Eintrag in der
   * Chronik, und der Zurück-Knopf tut, was man erwartet.
   */
  watch(active, (tab) => {
    const ziel = `#/${tab}`
    if (window.location.hash !== ziel) window.location.hash = ziel
  })

  // Beim Start normalisieren, ohne einen Eintrag zu erzeugen: Wer `#` oder
  // Unsinn eingibt, landet auf der Vorgabe und sieht das in der Adresszeile.
  const start = `#/${active.value}`
  if (window.location.hash !== start) window.history.replaceState(null, '', start)

  return { active, setTab: (tab: T) => (active.value = tab) }
}

export function useHashTab<T extends string>(tabs: readonly T[], fallback: T): HashTab<T> {
  geteilt ??= erzeugen(tabs, fallback)
  return geteilt as HashTab<T>
}
