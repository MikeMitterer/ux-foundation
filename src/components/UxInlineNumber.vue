<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

/**
 * Zahl, die in der Tabellenzeile direkt editierbar ist.
 *
 * Sieht im Ruhezustand wie Text aus — ein Eingabefeld je Zelle würde die
 * Tabelle mit Rahmen überziehen. Erst beim Klick wird daraus ein Feld.
 * Enter oder Verlassen übernimmt, Escape verwirft.
 *
 * Übernommen aus StockPortfolio, wo die Zeile entstanden ist. Geändert wurde
 * nur eines: Die beiden Beschriftungen kommen als Prop herein statt aus einem
 * Katalog — ein Paket hat keinen, und ein fest verdrahtetes Wort wäre in der
 * zweiten Sprache sofort falsch.
 */
const props = defineProps<{
  /**
   * Der Wert — `null` heißt **nicht gesetzt**.
   *
   * Das ist nicht dasselbe wie `0`: Eine TER, die niemand kennt, ist keine TER
   * von null Prozent. Wer diesen Zustand nicht braucht, gibt wie bisher eine
   * Zahl herein und merkt nichts davon.
   */
  value: number | null
  /** Formatierte Anzeige im Ruhezustand. */
  display: string
  /** Anzahl der erlaubten Nachkommastellen; ohne Angabe bleibt der Wert unverändert. */
  precision?: number
  min?: number
  max?: number
  /** Hebt den Wert farblich hervor, z.B. bei ungültiger Ziel-Summe. */
  invalid?: boolean
  disabled?: boolean
  /**
   * Wert, den ein geleertes Feld übernimmt. Ohne diese Angabe wird ein leeres
   * Feld verworfen.
   *
   * Der Unterschied hängt daran, was Leere in der jeweiligen Spalte bedeutet.
   * Beim Bestand nichts — wer das Feld leert und wegklickt, will seine 500
   * Stück nicht auf null setzen. Bei einer geplanten Stückzahl dagegen heißt
   * leer genau das: kein Trade. Dort ist es zumutbar, „0" tippen zu müssen,
   * hier war es eine Schikane.
   *
   * `null` ist dabei ein zulässiger Leerwert: Dann bedeutet Leeren „nicht
   * gesetzt" statt „null".
   */
  emptyValue?: number | null
  /** Tooltip im Ruhezustand — „Bearbeiten". */
  editLabel?: string
  /** Tooltip und zugänglicher Name des Löschkreuzes — „Leeren". */
  clearLabel?: string
}>()

/**
 * Ein Klick-Ziel zum Leeren gibt es nur dort, wo Leere überhaupt etwas
 * bedeutet — und nur, wenn gerade etwas drinsteht.
 */
const clearable = computed(
  () => props.emptyValue !== undefined && !props.disabled && props.value !== props.emptyValue,
)

const emit = defineEmits<{
  (event: 'commit', value: number | null): void
}>()

const editing = ref<boolean>(false)

/**
 * Der Entwurfswert.
 *
 * Bei `<input type="number">` wandelt Vues `v-model` die Eingabe selbsttätig
 * in eine Zahl um — der Wert ist hier also mal String, mal Zahl. Beides muss
 * `parseDraft()` verkraften.
 */
const draft = ref<string | number>('')
const inputRef = ref<HTMLInputElement | null>(null)

/** Auf den von `Number.toFixed()` unterstützten Bereich begrenzte Dezimalstellen. */
const normalizedPrecision = computed(() => {
  if (props.precision === undefined || !Number.isFinite(props.precision)) return undefined
  return Math.min(100, Math.max(0, Math.trunc(props.precision)))
})

/** Schrittweite des Zahlenfelds passend zur vereinbarten Zahl an Nachkommastellen. */
const inputStep = computed(() =>
  normalizedPrecision.value === undefined ? 'any' : 10 ** -normalizedPrecision.value,
)

/** Zustand des Werts — steuert Farbe und Zeiger der Anzeige. */
const valueState = computed(() => {
  if (props.disabled) return 'disabled'
  return props.invalid ? 'invalid' : 'normal'
})

async function startEdit(): Promise<void> {
  if (props.disabled) return
  // Ein nicht gesetzter Wert startet als leeres Feld, nicht als „null".
  draft.value = props.value === null ? '' : String(props.value)
  editing.value = true
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

/**
 * Liest den Entwurfswert als Zahl — akzeptiert Komma als Dezimaltrenner.
 *
 * Ein leeres Feld ergibt `emptyValue`, sonst `NaN` (und damit kein Commit).
 * `Number('')` wäre 0 — stiller Datenverlust in jeder Spalte, in der Leere
 * nichts bedeutet.
 */
function parseDraft(): number | null {
  const raw = draft.value
  if (typeof raw === 'number') return raw
  const trimmed = raw.trim()
  /*
   * Bewusst gegen `undefined` geprüft und nicht `??` verwendet: `null` ist
   * seit dem Zustand „nicht gesetzt" ein **gültiger** Leerwert, und `??` hätte
   * ihn wie eine fehlende Angabe behandelt — das Leeren wäre wirkungslos
   * geblieben.
   */
  if (trimmed === '') return props.emptyValue !== undefined ? props.emptyValue : Number.NaN
  return Number(trimmed.replace(',', '.'))
}

function commit(): void {
  if (!editing.value) return
  editing.value = false

  const parsed = parseDraft()

  // Leeren auf „nicht gesetzt": kein Wert zum Begrenzen, nur ein Zustand.
  if (parsed === null) {
    if (props.value !== null) emit('commit', null)
    return
  }
  if (!Number.isFinite(parsed)) return

  const rounded =
    normalizedPrecision.value === undefined
      ? parsed
      : Number(parsed.toFixed(normalizedPrecision.value))
  const clamped = Math.min(props.max ?? Number.MAX_SAFE_INTEGER, Math.max(props.min ?? 0, rounded))
  if (clamped === props.value) return

  emit('commit', clamped)
}

function cancel(): void {
  editing.value = false
}

/** Setzt auf den Leerwert zurück, ohne den Editor zu öffnen. */
function clear(): void {
  if (props.emptyValue === undefined) return
  editing.value = false
  emit('commit', props.emptyValue)
}

/**
 * Ein einziger Tastatur-Handler statt zweier `@keydown`-Modifier-Varianten:
 * die kompilieren beide auf `onKeydown` und haben sich gegenseitig gestört.
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault()
    commit()
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    cancel()
  }
}
</script>

<template>
  <!--
    Umschließender Rahmen nur zur Verankerung des Löschkreuzes: Es liegt
    absolut über der Zelle, damit weder Zeilenhöhe noch Spaltenbreite davon
    abhängen, ob gerade ein Wert drinsteht.
  -->
  <div
    class="inline-number"
    :class="{ 'inline-number--clearable': clearable && !editing }"
  >
    <!--
      Hält Breite und Höhe der Zelle — in beiden Zuständen dieselbe.

      Ohne ihn schrumpft der Rahmen auf seinen Inhalt, und ein
      `input[type=number]` bringt eine andere Eigenbreite mit als der Text
      daneben: Beim Klick in die Zelle sprang die ganze Spalte. `appearance:
      textfield` behebt das nicht — es nimmt nur die Spinner-Pfeile.

      Anzeige und Eingabefeld liegen deshalb absolut darüber und tragen selbst
      nichts zur Größe bei.
    -->
    <span
      class="inline-number__sizer tabular-nums"
      aria-hidden="true"
    >{{ display }}</span>

    <!--
      Kein Kasten um die Eingabe: nur eine Linie unter der Zahl. Der Wert bleibt
      dort stehen, wo er auch im Ruhezustand steht — die Zeile springt nicht.
      Die Spinner-Pfeile sind ausgeblendet, sie wären in einer schmalen
      Tabellenzelle nur Gedränge.
    -->
    <input
      v-if="editing"
      ref="inputRef"
      v-model="draft"
      type="number"
      :step="inputStep"
      :min="min"
      :max="max"
      class="inline-number__field tabular-nums"
      @blur="commit"
      @keydown="onKeydown"
    >

    <button
      v-else
      type="button"
      class="inline-number__display tabular-nums"
      :class="`inline-number__display--${valueState}`"
      :disabled="disabled"
      :title="disabled ? undefined : editLabel"
      @click.stop="startEdit"
    >
      {{ display }}
    </button>

    <!--
      Links neben der rechtsbündigen Zahl. Blass, bis die Maus über der Zelle
      steht — sonst stünde in jeder Zeile ein Kreuz und die Tabelle sähe aus
      wie ein Formular.

      „Links, wo die Zahl nicht hinreicht" stimmte nicht: Der Platzhalter baut
      genau so breit wie der Text, links bleibt also nichts übrig. Das Kreuz lag
      damit **auf** der ersten Ziffer. Deshalb macht `--clearable` oben eine
      Gasse dafür auf.
    -->
    <button
      v-if="clearable && !editing"
      type="button"
      class="inline-number__clear"
      :title="clearLabel"
      :aria-label="clearLabel"
      @click.stop="clear"
    >
      &times;
    </button>
  </div>
</template>

<style scoped lang="scss">
.inline-number {
  position: relative;

  /* Breite des Löschkreuzes — an *einer* Stelle, weil zwei Regeln sie
     brauchen: das Kreuz selbst und die Gasse, die ihm Platz macht. Zwei
     getippte Zahlen liefen beim ersten Feinschliff auseinander. */
  --clear-width: 1.125rem;

  /* Gemeinsame Maße — der Platzhalter muss exakt so breit bauen, wie die
     beiden sichtbaren Zustände es täten. */
  /*
   * Rechts **kein** Polster: Die Zahl ist rechtsbündig, und ein Polster dort
   * rückt sie von der Spaltenkante ab. Gemessen in einer Tabelle endete der
   * Spaltenkopf „TER" bei 826 und die Zahl darunter bei 810 — sechs davon
   * waren dieses Polster, der Rest ein Merkmal daneben. Eine Nachbarspalte
   * ohne diese Komponente stand bündig, was den Unterschied sichtbar machte.
   */
  &__sizer,
  &__field,
  &__display {
    padding: 0.125rem 0 0.125rem 0.375rem;
    border: 0;
    border-bottom: 1px solid transparent;
    text-align: right;
    font: inherit;
  }

  /*
   * Gasse für das Löschkreuz.
   *
   * Sie sitzt am **Platzhalter** und damit an der Breite des Rahmens: Anzeige
   * und Eingabefeld liegen absolut darüber und tragen nichts zur Größe bei.
   * Ohne sie baut der Rahmen genau so breit wie der Text, links bleibt nichts
   * frei, und das Kreuz liegt auf der ersten Ziffer.
   *
   * Nur wenn es auch eines gibt — sonst trüge jede Zelle eine leere Gasse.
   * Die Zahl wandert dabei nicht: Sie ist rechtsbündig, die Gasse wächst nach
   * links.
   */
  &--clearable &__sizer,
  &--clearable &__field,
  &--clearable &__display {
    padding-left: calc(0.375rem + var(--clear-width));
  }

  &__sizer {
    display: block;
    visibility: hidden;
    /* Nie umbrechen: Ein Umbruch im Platzhalter änderte die Höhe der Zeile. */
    white-space: nowrap;

    /*
     * Genug Breite für eine Eingabe, auch wenn die Anzeige kurz ist.
     *
     * Der Platzhalter baut aus dem **Anzeigetext**, und der ist im leeren
     * Zustand ein Gedankenstrich. Das Eingabefeld liegt darüber und erbt diese
     * Breite: Wer in eine leere Zelle tippte, hatte Platz für ein Zeichen, und
     * „0,12" schob sich beim Tippen aus dem Bild.
     *
     * `ch` und nicht Pixel, damit es mit der Schriftgröße mitgeht; sechs Stellen
     * fassen auch „100,00" ohne Abschneiden. Spalten mit mindestens einem Wert ändern
     * sich dadurch nicht — sie sind ohnehin breiter.
     */
    min-width: 7ch;
  }

  &__field,
  &__display {
    position: absolute;
    inset: 0;
    width: 100%;
    min-width: 0;
  }

  &__field {
    /* Zahlenfelder bringen eine Eigenbreite mit — sie sprengte die Spalte. */
    appearance: textfield;
    border-bottom-color: token(--accent);
    background-color: transparent;
    color: token(--text-primary);
    outline: none;

    /* Spinner-Pfeile ausblenden — in einer Tabellenzelle nur Ballast. */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      appearance: none;
      margin: 0;
    }
  }

  &__display {
    transition: border-color 0.15s ease;

    &:hover { border-bottom-color: token(--border-default); }

    &--disabled {
      @include muted(null);
      cursor: default;
    }

    &--invalid { color: token(--status-out); }
  }

  &__clear {
    position: absolute;
    top: 50%;
    left: 0;
    width: var(--clear-width);
    padding: 0;
    opacity: 0;
    line-height: 1;
    @include muted(null);
    transform: translateY(-50%);
    transition: opacity 0.15s ease, color 0.15s ease;

    &:hover { color: token(--status-out); }
    &:focus-visible { opacity: 1; }
  }

  &:hover &__clear { opacity: 1; }
}
</style>
