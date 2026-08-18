/**
 * Naive-UI-Overrides aus den Theme-Token.
 *
 * Naive UI kennt unsere CSS-Variablen nicht und bringt eigene Farben mit.
 * Ohne diese Brücke liefen Tabelle, Dialoge und Eingabefelder farblich
 * neben dem Rest her. Die Werte werden zur Laufzeit aus den gesetzten
 * Variablen gelesen — es gibt also nur **eine** Quelle je Theme.
 */

import type { GlobalThemeOverrides } from 'naive-ui'

/**
 * Liest eine CSS-Variable und macht daraus eine gültige Farbangabe.
 *
 * Die Tokens stehen als RGB-Tripel (`23 23 23`), damit Tailwinds
 * Deckkraft-Zusätze greifen. Naive UI erwartet dagegen eine fertige Farbe.
 *
 * @param name  Variablenname inklusive `--`.
 * @param alpha Optionale Deckkraft zwischen 0 und 1.
 */
function token(name: string, alpha?: number): string {
  const triple = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!triple) return 'transparent'

  // Naive UIs Farbparser (seemly) kennt die moderne Schreibweise mit
  // Leerzeichen nicht — `rgb(42 120 214)` wirft dort einen Fehler und reißt
  // das Rendern der Tabelle mit. Deshalb die alte Form mit Kommas.
  const parts = triple.split(/[\s,]+/).filter(Boolean)
  if (parts.length < 3) return 'transparent'

  const [r, g, b] = parts
  return alpha === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Liest eine CSS-Variable roh — für alles, was keine Farbe ist.
 *
 * @param name Variablenname inklusive `--`.
 */
function cssValue(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Baut die Overrides für das gerade aktive Theme.
 * Muss aufgerufen werden, **nachdem** `data-theme` gesetzt wurde.
 */
export function buildNaiveOverrides(): GlobalThemeOverrides {
  const surfaceCard = token('--surface-card')
  const surfaceRaised = token('--surface-raised')
  const textPrimary = token('--text-primary')
  const textSecondary = token('--text-secondary')
  const border = token('--border-default')
  const accent = token('--accent')

  /*
   * Was über dem Inhalt schwebt, bekommt einen Schatten — sonst klebt ein
   * Dialog auf der Seite und wird als Teil des Inhalts gelesen. Naive bringt
   * eigene Schatten mit, die auf dunklen Paletten praktisch unsichtbar sind;
   * die Stufen aus `tokens.css` sind nach Helligkeit des Inhalts gestaffelt.
   */
  const shadowSm = cssValue('--shadow-sm')
  const shadowLg = cssValue('--shadow-lg')

  return {
    common: {
      /*
       * Radien aus der Hausskala.
       *
       * Ohne diese zwei Zeilen bleibt Naive UI bei seinen eigenen 3 px,
       * während alles Selbstgebaute 8 beziehungsweise 12 px trägt — gemessen
       * in einer laufenden App: Plakette 8 px, Naive-Knopf daneben 3 px. Das
       * sieht man nicht sofort, aber man sieht, dass etwas nicht stimmt.
       *
       * Die Schrift braucht keine Entsprechung: Sie erbt über CSS und stimmt
       * dadurch von selbst.
       */
      borderRadius: cssValue('--radius-sm'),
      borderRadiusSmall: cssValue('--radius-sm'),

      primaryColor: accent,
      primaryColorHover: accent,
      primaryColorPressed: accent,
      textColorBase: textPrimary,
      textColor1: textPrimary,
      textColor2: textSecondary,
      textColor3: token('--text-muted'),
      borderColor: border,
      dividerColor: token('--border-subtle'),
      cardColor: surfaceCard,
      modalColor: surfaceRaised,
      popoverColor: surfaceRaised,
      bodyColor: token('--surface-page'),
      inputColor: surfaceRaised,
      errorColor: token('--status-out'),
      successColor: token('--status-ok'),
      warningColor: token('--status-near'),

      /*
       * Naives eigene Stufen. `boxShadow2` und `3` treiben unter anderem
       * Auswahllisten und Datumsfelder — die schweben wie ein Menü, nicht wie
       * ein Dialog.
       */
      boxShadow1: shadowSm,
      boxShadow2: shadowSm,
      boxShadow3: shadowLg,
    },
    /*
     * Ein Reiter-Inhalt ist Inhalt, keine zweite Ebene.
     *
     * Naive setzt `paneTextColor` auf `textColor2` — bei uns die leisere
     * Stufe. Damit erbt **alles** im Pane die gedämpfte Farbe, bis hin zur
     * Abschnittsüberschrift: Im Schaufenster stand die größte Überschrift der
     * Seite leiser da als der Fließtext darunter. Man sucht den Fehler dann
     * bei der Überschrift, und dort ist er nicht.
     */
    Tabs: {
      paneTextColor: textPrimary,
    },
    DataTable: {
      thColor: 'transparent',
      tdColor: 'transparent',
      thTextColor: textSecondary,
      tdTextColor: textPrimary,
      borderColor: token('--border-subtle'),
      // Zeilen-Hover: dezent, damit die Zahlen lesbar bleiben.
      tdColorHover: surfaceRaised,
    },
    Card: {
      color: surfaceCard,
      borderColor: border,

      /*
       * Der Kartentitel ist eine Überschrift und soll so wiegen.
       *
       * Naive nimmt dafür `fontWeightStrong`, bei ihnen 500 — in unserer
       * Skala die Arbeitsstufe, nicht die einer Überschrift. Damit stand der
       * Titel im selben Gewicht wie der Text darunter und markierte keinen
       * Anfang.
       *
       * Nur das Gewicht: Die Größen bringt Naive über `size` schon richtig
       * gestaffelt mit (18 px ab `medium`), und eine zweite Staffelung
       * danebenzusetzen hieße, dieselbe Entscheidung zweimal zu treffen.
       */
      titleFontWeight: '600',
    },
    /*
     * Ein Dialog steckt in einer Karte (`preset="card"`), und deren Schatten
     * kommt aus dem Card-Theme — `Modal.boxShadow` allein bleibt deshalb
     * wirkungslos, das war beim ersten Versuch zu sehen. Gesetzt wird er
     * darum am **Peer**: So trägt die Karte *im Dialog* die starke Stufe,
     * während die Karten im Inhalt bei der leisen bleiben.
     */
    Modal: {
      boxShadow: shadowLg,
      color: surfaceRaised,
      peers: {
        Card: { boxShadow: shadowLg },
      },
    },
    Dialog: {
      color: surfaceRaised,
    },
    // Toasts und Meldungen schweben knapp über der Seite.
    Notification: {
      boxShadow: shadowSm,
      color: surfaceRaised,
    },
    Message: {
      boxShadow: shadowSm,
    },
    // Menüs und Popover.
    Popover: {
      boxShadow: shadowSm,
      color: surfaceRaised,
      textColor: textPrimary,
    },
    /*
     * Der „?"-Tooltip braucht einen **eigenen** Eintrag, obwohl er ein Popover
     * ist. Naive gestaltet ihn absichtlich gegenläufig: In der hellen Vorlage
     * steht `color: rgba(0,0,0,.85)` und `textColor: baseColor`, also weiße
     * Schrift auf fast schwarzem Grund — ein Tooltip soll sich vom Inhalt
     * abheben.
     *
     * Überschrieben war bisher nur die Fläche über `Popover`. Die Schrift kam
     * weiter aus der Tooltip-Vorlage, also Weiß. In dunklen Paletten fiel das
     * nie auf, weil `--surface-raised` dort dunkel ist. In `sepia` ist sie
     * Weiß — gemessen Kontrast **1.0**, der Hinweis war schlicht leer.
     *
     * Deshalb kommen hier beide Hälften aus denselben Token.
     */
    Tooltip: {
      boxShadow: shadowSm,
      color: surfaceRaised,
      textColor: textPrimary,
    },
    Input: {
      color: surfaceRaised,
      border: `1px solid ${border}`,
    },
  }
}

/**
 * Overrides für Bedienelemente, die **auf einer Leiste** sitzen.
 *
 * Kopf- und Statuszeile holen ihre Farben aus eigenen Token — genau deshalb
 * darf ein Theme die Leisten umkehren und hellen Inhalt zwischen dunkle Ränder
 * setzen. Naive UI weiß davon nichts: Es bekommt über
 * {@link buildNaiveOverrides} die Farben des **Inhalts**, und ein Knopf in der
 * Kopfzeile trägt damit dunkle Schrift auf dunkler Leiste.
 *
 * Gemessen in `sepia` (heller Inhalt, dunkle Leisten): Der Knopf
 * „Aktualisieren" kam auf **1,38:1** — unsichtbar. Mit diesen Overrides holt
 * er seine Schrift und seinen Rand aus `--text-bar` und `--border-bar` und
 * liegt damit dort, wo auch die Menüpunkte liegen.
 *
 * Verwendet wird das über einen zweiten `NConfigProvider` **um die rechte
 * Gruppe der Leiste** — nicht global, sonst bekäme der ganze Inhalt die
 * Leisten-Farben:
 *
 * ```vue
 * <template #actions>
 *   <NConfigProvider :theme-overrides="barOverrides">
 *     <NButton …>
 *   </NConfigProvider>
 * </template>
 * ```
 *
 * Muss wie die andere Brücke aufgerufen werden, **nachdem** `data-theme` steht.
 */
export function buildBarNaiveOverrides(): GlobalThemeOverrides {
  const textBar = token('--text-bar')
  const textBarSecondary = token('--text-bar-secondary')
  const textBarMuted = token('--text-bar-muted')
  const borderBar = token('--border-bar')
  const surfaceHeader = token('--surface-header')
  // Nicht `--surface-raised`: Die gehört zum Inhalt und ist in Themes mit
  // umgekehrten Leisten das Gegenteil dessen, was die Leiste braucht.
  const raisedOnBar = token('--surface-bar-raised', 0.12)

  return {
    common: {
      borderRadius: cssValue('--radius-sm'),
      borderRadiusSmall: cssValue('--radius-sm'),

      textColorBase: textBar,
      textColor1: textBar,
      textColor2: textBar,
      textColor3: textBarMuted,
      borderColor: borderBar,
      dividerColor: borderBar,
      // Popover und Menüs, die aus der Leiste aufklappen, bleiben auf ihrer Fläche.
      cardColor: surfaceHeader,
      modalColor: surfaceHeader,
      popoverColor: surfaceHeader,
      bodyColor: surfaceHeader,
      inputColor: surfaceHeader,
    },
    Button: {
      /*
       * Die Fläche bleibt durchsichtig: Die Leiste ist der Grund, und ein
       * eigener Kasten darauf sähe aus wie ein zweiter Anstrich. Was der Knopf
       * braucht, ist lesbare Schrift und ein sichtbarer Rand.
       */
      color: 'transparent',
      textColor: textBar,
      textColorHover: textBar,
      textColorPressed: textBar,
      textColorFocus: textBar,
      textColorDisabled: textBarMuted,
      border: `1px solid ${borderBar}`,
      borderHover: `1px solid ${textBarSecondary}`,
      borderPressed: `1px solid ${textBarSecondary}`,
      borderFocus: `1px solid ${textBarSecondary}`,
      borderDisabled: `1px solid ${borderBar}`,

      /*
       * Die rahmenlose Spielart (`quaternary`) trägt dieselbe Abstufung wie ein
       * Menüpunkt: leise im Ruhezustand, volle Textfarbe beim Überfahren, und
       * eine leicht erhobene Fläche statt eines Rahmens. So steht rechts kein
       * Kasten, der lauter ruft als die Punkte links.
       */
      textColorText: textBarSecondary,
      textColorTextHover: textBar,
      textColorTextPressed: textBar,
      textColorTextFocus: textBar,
      textColorTextDisabled: textBarMuted,
      colorQuaternary: 'transparent',
      colorQuaternaryHover: raisedOnBar,
      colorQuaternaryPressed: raisedOnBar,
    },
  }
}
