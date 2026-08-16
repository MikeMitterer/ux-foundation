/**
 * Die wiederkehrenden Navigationssymbole.
 *
 * Warum sie hier liegen und nicht in jeder App: Der Skill verlangt, dass ein
 * wiederkehrender Menüpunkt über alle Apps dasselbe Symbol trägt — das ist der
 * Punkt, an dem eine Sammlung zusammenwächst oder auseinanderfällt. Zweimal
 * abgezeichnet heißt zweimal leicht anders.
 *
 * Als Daten und nicht als fertige Komponente, damit eine App sie inline
 * rendern kann (einfärbbar, skalierbar, `aria-hidden`) ohne eine
 * Komponentenbibliothek dieses Pakets zu erben.
 *
 * Zeichenstil, verbindlich: Strichsymbole, `currentColor`, Strichstärke 2,
 * runde Enden, rund 15 px in der Kopfzeile. Keine gefüllten Flächen außer als
 * bewusste Betonung — zwei Symbolsprachen in einer Kopfzeile sieht man sofort.
 */

/** Ein Pfad innerhalb eines Symbols. `fill` nur für bewusste Betonung. */
export interface IconPath {
  /** SVG-Pfaddaten oder — bei `shape: 'circle'` — leer. */
  d?: string
  /** Kreis statt Pfad: Mittelpunkt und Radius. */
  circle?: { cx: number; cy: number; r: number }
  /** Gefüllt statt gestrichen. Nur für Punkte und Betonungen. */
  filled?: boolean
  /** Runde Enden. Vorgabe ist `true`; gerade Enden brauchen eine Begründung. */
  round?: boolean
}

/** Ein Symbol: Zeichenfläche und die Pfade darin. */
export interface IconDefinition {
  viewBox: string
  paths: IconPath[]
}

/**
 * Kennungen der wiederkehrenden Menüpunkte.
 *
 * Bewusst nach der *Rolle* benannt und nicht nach dem Aussehen: Eine App
 * nennt den Bereich „Dashboard", eine andere „Übersicht" — das Symbol bleibt
 * dasselbe.
 */
export type NavIconName =
  | 'dashboard'
  | 'rebalancing'
  | 'instruments'
  | 'settings'

export const NAV_ICONS: Record<NavIconName, IconDefinition> = {
  /* Übersicht — drei aufsteigende Balken. */
  dashboard: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M3 12h4v8H3z' },
      { d: 'M10 7h4v13h-4z' },
      { d: 'M17 4h4v16h-4z' },
    ],
  },

  /* Ausgleichen — zwei gegenläufige Pfeile. */
  rebalancing: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M4 7h11M4 7l3-3M4 7l3 3' },
      { d: 'M20 17H9M20 17l-3-3M20 17l-3 3' },
    ],
  },

  /* Papiere / Assets — Globus, Kreis mit Meridianen. */
  instruments: {
    viewBox: '0 0 24 24',
    paths: [
      { circle: { cx: 12, cy: 12, r: 9 } },
      { d: 'M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z' },
    ],
  },

  /*
   * Einstellungen — Schieberegler, ausdrücklich **kein Zahnrad**. Das steckt
   * schon in jedem Browser- und Systemmenü und sagt „irgendetwas technisches";
   * die Schieberegler sagen „hier stellt man Werte ein" — und genau das tut
   * die Seite. Die drei Punkte sind die eine erlaubte gefüllte Fläche.
   */
  settings: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M4 6h16M4 12h16M4 18h16' },
      { circle: { cx: 9, cy: 6, r: 2 }, filled: true },
      { circle: { cx: 15, cy: 12, r: 2 }, filled: true },
      { circle: { cx: 7, cy: 18, r: 2 }, filled: true },
    ],
  },
}

/** Alle Kennungen, für Auswahllisten und die Schaufenster-App. */
export const NAV_ICON_NAMES = Object.keys(NAV_ICONS) as NavIconName[]
