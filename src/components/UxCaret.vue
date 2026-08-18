<script setup lang="ts">
/**
 * Der Pfeil, der eine aufklappbare Fläche als solche kenntlich macht.
 *
 * Lag viermal vor (T-16): zweimal in StockInfo als Zeichen `⌄`, dreimal in
 * StockPortfolio als SVG. Der SVG-Pfad war überall derselbe, Strichstärke,
 * Größe und Deckkraft aber je Fundstelle anders — abgeschrieben und danach
 * einzeln verstellt.
 *
 * **Warum eine Form und kein Zeichen.** `⌄` (U+2304) sitzt tief in seinem
 * Em-Quadrat. Der Kasten steht dabei mittig, das Zeichen darin klebt am
 * unteren Rand — wer den Kasten misst, findet den Fehler nicht. Schlimmer:
 * Gedreht um 180° kippt dasselbe Zeichen nach oben, eine feste optische
 * Korrektur kann also nie beide Zustände treffen. Der Pfad hier liegt
 * symmetrisch um die Kastenmitte (x 6…18, y 9…15), die Drehung verschiebt ihn
 * damit nicht.
 *
 * **Farbe, Deckkraft und Abstand bleiben beim Aufrufer.** Gezeichnet wird in
 * `currentColor`; ob der Pfeil gedämpft ist, beim Überfahren aufhellt oder im
 * Akzent steht, weiß nur die Umgebung. Der Wurzelknoten trägt die
 * Scope-Kennung der aufrufenden Komponente, `.ux-caret` lässt sich dort also
 * ohne `:deep()` ansprechen.
 */
withDefaults(
  defineProps<{
    /** Ist der zugehörige Bereich aufgeklappt? */
    open: boolean
    /**
     * Was der Pfeil aussagt — beide Fassungen kommen vor und meinen
     * Verschiedenes:
     *
     * - `flip` — zu zeigt nach unten, offen nach oben: *hier geht etwas auf*.
     * - `turn` — offen zeigt nach unten, zu zur Seite: *hier hängt etwas
     *   darunter*.
     */
    motion?: 'flip' | 'turn'
    /**
     * Größenstufe statt freier Zahl. Die Fundstellen hatten 0.7, 0.75, 0.875
     * und 0.95 rem — vier Werte, die niemand entschieden hat.
     */
    size?: 'sm' | 'md'
  }>(),
  { motion: 'flip', size: 'md' },
)
</script>

<template>
  <svg
    class="ux-caret"
    :class="[`ux-caret--${motion}`, `ux-caret--${size}`, { 'ux-caret--open': open }]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!--
      `aria-hidden` am Element darüber: Den Zustand sagt `aria-expanded` an dem
      Knopf, zu dem der Pfeil gehört. Ein vorgelesener Pfeil wäre dieselbe
      Auskunft ein zweites Mal, nur stummer.

      Der Kommentar steht **innerhalb** des `svg`: Ein Kommentar davor macht die
      Komponente mehrwurzelig, und damit greift weder das Durchreichen von
      Attributen noch findet ein Test die Wurzel.
    -->
    <path d="M6 9 L12 15 L18 9" />
  </svg>
</template>

<style scoped lang="scss">
@use '../styles/shared' as *;

/*
 * `vertical-align: middle` statt der Grundlinie: Ein Inline-Block sitzt sonst
 * mit seiner Unterkante auf der Grundlinie und hängt damit unter dem Text
 * daneben. In einer Flex-Zeile ist die Angabe wirkungslos und stört nicht.
 */
.ux-caret {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
  transition: transform 0.15s ease;

  &--sm { width: 0.75rem; height: 0.75rem; }
  &--md { width: 0.95rem; height: 0.95rem; }

  // Zu = nach unten (der Pfad zeigt bereits dorthin), offen = nach oben.
  &--flip.ux-caret--open { transform: rotate(180deg); }

  // Offen = nach unten, zu = zur Seite. Umgekehrte Logik, deshalb greift die
  // Drehung hier am **geschlossenen** Zustand.
  &--turn:not(.ux-caret--open) { transform: rotate(-90deg); }
}
</style>
