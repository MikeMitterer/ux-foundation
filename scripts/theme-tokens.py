#!/usr/bin/env python3
"""Themes prüfen, reparieren, erzeugen und veröffentlichen.

Vier Unterbefehle:

  check   Misst jedes Theme einer Token-Datei gegen die Grenzwerte in
          `REGELN` weiter unten. Beantwortet „hält das noch?", ohne dass
          jemand jede Palette von Hand durchrechnet.

  repair  Hebt die leisen Textstufen bestehender Themes auf 4.5:1 an, ohne
          Farbton und Sättigung anzutasten.

  build   Erzeugt einen Token-Block aus einer HSL-Vorgabe und *löst* dabei die
          Werte, an denen ein Grenzwert hängt, statt sie zu raten.

  export  Gibt alle Paletten als Markdown auf die Standardausgabe — zum
          Nebeneinanderlesen, wenn einen die Werte im Zusammenhang
          interessieren.

          Ausdrücklich **nicht**, um daraus eine zweite Liste anzulegen. Der
          Skill `ux-standards` führte einmal eine (`references/themes.md`);
          sie ist entfernt, weil eine Datei außerhalb dieses Repos von keinem
          Test bewacht werden kann und deshalb sicher irgendwann etwas
          anderes behauptet als `tokens.css`. Genau so ist es passiert.
          Wer die Werte braucht, erzeugt sie sich hiermit neu.

Warum HSL und nicht Hex: Ein Theme wird über Farbton und Sättigung entworfen,
und genau die sieht man einem Hex-Wert nicht an. Ein real vorgekommener Fall:
Ein Theme, das nach der Firmenfarbe benannt war, lag 40° neben ihr — in Hex
fällt das niemandem auf, in HSL steht es als Zahl da.

Warum lösen statt setzen: Ebenfalls ein realer Fall. Ein von Hand gesetztes
`--text-muted` verfehlte 4.5:1 gegen die Kartenfläche um knapp einen Punkt und
stand so über Monate im Basis-Theme. Ein gerechneter Wert kann das nicht.
"""

from __future__ import annotations

import argparse
import colorsys
import json
import re
import sys
from pathlib import Path

# ─── Ausgabe ────────────────────────────────────────────────────────────────

ROT = "\033[31m"
GRUEN = "\033[32m"
GELB = "\033[33m"
BLAU = "\033[34m"
GRAU = "\033[90m"
FETT = "\033[1m"
AUS = "\033[0m"

FARBIG = sys.stdout.isatty()


def faerbe(text: str, farbe: str) -> str:
    """Färbt Text, solange die Ausgabe auf einem Terminal landet."""
    return f"{farbe}{text}{AUS}" if FARBIG else text


# ─── Farbrechnung ───────────────────────────────────────────────────────────

Farbe = tuple[int, int, int]


def aus_hsl(h: float, s: float, lightness: float) -> Farbe:
    """HSL in Grad/Prozent → RGB-Tripel, wie die Token es erwarten."""
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360, lightness / 100, s / 100)
    return tuple(round(v * 255) for v in (r, g, b))


def nach_hsl(c: Farbe) -> tuple[int, int, int]:
    """RGB-Tripel → HSL in Grad/Prozent, gerundet."""
    h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in c))
    return round(h * 360), round(s * 100), round(l * 100)


def _linear(kanal: int) -> float:
    c = kanal / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def leuchtdichte(c: Farbe) -> float:
    """Relative Leuchtdichte nach WCAG."""
    return 0.2126 * _linear(c[0]) + 0.7152 * _linear(c[1]) + 0.0722 * _linear(c[2])


def kontrast(a: Farbe, b: Farbe) -> float:
    """Kontrastverhältnis zweier Farben, 1.0 bis 21.0."""
    hell, dunkel = sorted((leuchtdichte(a), leuchtdichte(b)), reverse=True)
    return round((hell + 0.05) / (dunkel + 0.05), 2)


def farbabstand(a: float, b: float) -> int:
    """Kleinerer Winkel zwischen zwei Farbtönen, 0 bis 180 Grad."""
    d = abs(a - b) % 360
    return round(min(d, 360 - d))


def loese_helligkeit(h: float, s: float, grund: Farbe, ziel: float) -> int:
    """Kleinste Helligkeit in Prozent, die gegen `grund` noch `ziel`:1 erreicht.

    Sucht von dunkel nach hell, nimmt also den zurückhaltendsten Wert, der die
    Anforderung gerade erfüllt — leiser Text soll leise bleiben.
    """
    for lightness in range(10, 101):
        if kontrast(aus_hsl(h, s, lightness), grund) >= ziel:
            return lightness
    raise ValueError(f"kein Wert erreicht {ziel}:1 gegen {als_hex(grund)}")


def als_hex(c: Farbe) -> str:
    return "#%02x%02x%02x" % c


# ─── Token-Datei lesen ──────────────────────────────────────────────────────

# Rückfallkette: Wer ein Leisten-Token nicht setzt, bekommt diese Fläche.
# Steht so in `tokens.css` an den Token selbst und muss hier stehen, sonst
# meldet der Prüfer für jedes Theme ohne eigene Leisten fälschlich „fehlt".
RUECKFALL = {
    "--surface-header": "--surface-page",
    "--surface-statusbar": "--surface-card",
    "--text-bar": "--text-primary",
    "--text-bar-secondary": "--text-secondary",
    "--text-bar-muted": "--text-muted",
    "--border-bar": "--border-default",
}

_TRIPEL = re.compile(r"^\d{1,3}\s+\d{1,3}\s+\d{1,3}$")
_VERWEIS = re.compile(r"^var\(\s*(--[\w-]+)\s*\)$")


def _bloecke(text: str) -> tuple[dict[str, str], dict[str, dict[str, str]]]:
    """Zerlegt eine Token-Datei in Grundschicht und Themes.

    Grundschicht sind alle `:root { … }` ohne Attribut — dort stehen die
    themeunabhängigen Werte und die Rückfälle. Themes sind
    `:root[data-theme='name'] { … }`.
    """
    grund: dict[str, str] = {}
    themes: dict[str, dict[str, str]] = {}

    for treffer in re.finditer(r":root(\[data-theme=['\"]([\w-]+)['\"]\])?\s*\{([^}]*)\}", text):
        name = treffer.group(2)
        werte = dict(re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", treffer.group(3)))
        werte = {k: v.strip() for k, v in werte.items()}
        if name is None:
            grund.update(werte)
        else:
            themes.setdefault(name, {}).update(werte)

    return grund, themes


def _aufloesen(name: str, eigene: dict[str, str], grund: dict[str, str],
               tiefe: int = 0) -> Farbe | None:
    """Löst einen Token-Namen zu einer Farbe auf — über var() und Rückfall."""
    if tiefe > 8:
        return None

    roh = eigene.get(name, grund.get(name))
    if roh is None:
        ziel = RUECKFALL.get(name)
        return _aufloesen(ziel, eigene, grund, tiefe + 1) if ziel else None

    if _TRIPEL.match(roh):
        return tuple(int(x) for x in roh.split())

    verweis = _VERWEIS.match(roh)
    if verweis:
        return _aufloesen(verweis.group(1), eigene, grund, tiefe + 1)

    return None


def lies_themes(pfad: Path) -> dict[str, dict[str, Farbe]]:
    """Liest alle Themes einer Token-Datei als aufgelöste Farbwerte."""
    grund, roh = _bloecke(pfad.read_text(encoding="utf-8"))
    namen = sorted({k for werte in roh.values() for k in werte} | set(grund) | set(RUECKFALL))

    ergebnis: dict[str, dict[str, Farbe]] = {}
    for theme, eigene in roh.items():
        aufgeloest = {}
        for token in namen:
            farbe = _aufloesen(token, eigene, grund)
            if farbe is not None:
                aufgeloest[token] = farbe
        ergebnis[theme] = aufgeloest
    return ergebnis


# ─── Prüfung ────────────────────────────────────────────────────────────────

# (Vordergrund, Hintergrund, Grenzwert, hart?, Begründung)
REGELN = [
    ("--text-primary", "--surface-card", 7.0, True, "Fließtext auf der Karte"),
    ("--text-secondary", "--surface-card", 4.5, True, "zweite Ebene auf der Karte"),
    ("--text-muted", "--surface-card", 4.5, True, "Beschriftungen auf der Karte"),
    ("--accent-contrast", "--accent", 4.5, True, "Text auf der Akzentfläche"),
    ("--text-bar", "--surface-header", 7.0, True, "Wortmarke in der Kopfzeile"),
    ("--text-bar-muted", "--surface-header", 4.5, True, "leiser Text in der Kopfzeile"),
    ("--text-bar-muted", "--surface-statusbar", 4.5, True, "leiser Text in der Statuszeile"),
    ("--text-muted", "--surface-raised", 4.5, False, "Beschriftungen auf Menüs und Popovern"),
    ("--accent", "--surface-card", 3.0, False, "Akzent als Fläche erkennbar"),
    ("--brand-contrast", "--brand-from", 3.0, False, "Zeichen auf der Plakette (heller Pol)"),
    ("--brand-contrast", "--brand-to", 3.0, False, "Zeichen auf der Plakette (dunkler Pol)"),
]


def pruefe(theme: str, token: dict[str, Farbe]) -> tuple[list[str], list[str]]:
    """Misst ein Theme gegen alle Regeln. Liefert (Fehler, Warnungen)."""
    fehler, warnungen = [], []

    for vorn, hinten, grenze, hart, warum in REGELN:
        a, b = token.get(vorn), token.get(hinten)
        if a is None or b is None:
            continue
        wert = kontrast(a, b)
        if wert < grenze:
            satz = f"{vorn} auf {hinten}: {wert}:1 < {grenze}:1 — {warum}"
            (fehler if hart else warnungen).append(satz)

    return fehler, warnungen


def zonen(token: dict[str, Farbe]) -> str:
    """Beschreibt, wie deutlich sich Kopf, Inhalt und Fuß voneinander abheben.

    Zwei Zahlen je Paar: Kontrastverhältnis (Helligkeit) und Farbtonabstand.
    Beides ist nötig — das Verhältnis allein ist für Farbton blind und meldet
    1.02 für eine lila Leiste auf bernsteinfarbenem Grund.
    """
    kopf, seite, fuss = (token.get(k) for k in
                         ("--surface-header", "--surface-page", "--surface-statusbar"))
    if not all((kopf, seite, fuss)):
        return ""

    return (f"Kopf/Inhalt {kontrast(kopf, seite)} ({farbabstand(nach_hsl(kopf)[0], nach_hsl(seite)[0])}°) · "
            f"Fuß/Inhalt {kontrast(fuss, seite)} ({farbabstand(nach_hsl(fuss)[0], nach_hsl(seite)[0])}°) · "
            f"Kopf/Fuß {kontrast(kopf, fuss)}")


def befehl_check(pfad: Path, ausführlich: bool) -> int:
    """Misst alle Themes einer Datei. Rückgabe ist der Exit-Code."""
    themes = lies_themes(pfad)
    if not themes:
        print(faerbe(f"Keine Themes in {pfad} gefunden.", ROT), file=sys.stderr)
        return 2

    print(f"{faerbe(str(pfad), FETT)} — {len(themes)} Themes\n")
    kaputt = 0

    for name in sorted(themes):
        token = themes[name]
        fehler, warnungen = pruefe(name, token)
        if fehler:
            kaputt += 1
            zeichen, farbe = "FEHLER", ROT
        elif warnungen:
            zeichen, farbe = "Hinweis", GELB
        else:
            zeichen, farbe = "in Ordnung", GRUEN

        seite = token.get("--surface-page")
        ton = f"{nach_hsl(seite)[0]}°/{nach_hsl(seite)[1]}%" if seite else "—"
        print(f"  {faerbe(name.ljust(12), FETT)} {faerbe(zeichen.ljust(11), farbe)} {faerbe(ton, GRAU)}")

        for satz in fehler:
            print(f"      {faerbe('✗', ROT)} {satz}")
        for satz in warnungen:
            print(f"      {faerbe('!', GELB)} {satz}")
        if ausführlich and (beschreibung := zonen(token)):
            print(f"      {faerbe('·', BLAU)} {beschreibung}")

    print()
    if kaputt:
        print(faerbe(f"{kaputt} Theme(s) unter einem harten Grenzwert.", ROT))
        return 1
    print(faerbe("Alle harten Grenzwerte eingehalten.", GRUEN))
    return 0


# ─── Reparieren ─────────────────────────────────────────────────────────────

def naechster_wert(c: Farbe, gruende: list[Farbe], ziel: float) -> Farbe:
    """Kleinste Helligkeitsänderung, die gegen *alle* Gründe `ziel` erreicht.

    Ausgehend vom heutigen Wert, in die Richtung, die den Kontrast erhöht. Ein
    gemeinsamer Zielwert für alle Themes gliche sie einander an und nähme ihnen
    genau das, was sie unterscheidet.
    """
    h, s, start = nach_hsl(c)
    richtung = 1 if leuchtdichte(c) > leuchtdichte(max(gruende, key=leuchtdichte)) else -1

    lightness = float(start)
    while 0 <= lightness <= 100:
        kandidat = aus_hsl(h, s, lightness)
        if all(kontrast(kandidat, g) >= ziel for g in gruende):
            return kandidat
        lightness += richtung
    raise ValueError(f"kein Wert erreicht {ziel}:1")


def _flaechen_fuer(token: dict[str, Farbe], leisten_token: str) -> list[Farbe]:
    """Flächen, gegen die eine leise Textstufe beim Reparieren bestehen muss.

    `--surface-raised` fehlt hier bewusst: Beim Reparieren steht
    `--text-secondary` fest, nur `--text-muted` bewegt sich, und der Abstand
    zwischen beiden kann dadurch nur schrumpfen. Gemessen sank er beim Lösen
    gegen `raised` auf 8 % (forest) und rund 4 % (slate) — dann gibt es keine
    leise Stufe mehr. Menüs sind kurzlebig, eine Tabelle liest man minutenlang.

    Die Leisten zählen nur mit, wenn das Theme dort keinen eigenen Wert hat:
    Bei hellem Inhalt zwischen dunklen Leisten kann keine einzelne Farbe beides.
    """
    flaechen = [token["--surface-card"]]
    if leisten_token not in token:
        flaechen.append(token.get("--surface-header", token["--surface-page"]))
        flaechen.append(token.get("--surface-statusbar", token["--surface-card"]))
    return flaechen


def befehl_repair(pfad: Path, schreiben: bool) -> int:
    """Hebt die leisen Stufen auf 4.5:1 an, ohne Farbton und Sättigung zu ändern."""
    text = pfad.read_text(encoding="utf-8")
    themes = lies_themes(pfad)
    aenderungen: list[tuple[str, str, Farbe, Farbe]] = []

    for name in sorted(themes):
        token = themes[name]
        if "--surface-card" not in token:
            continue

        for stufe, leisten_token in (("--text-secondary", "--text-bar-secondary"),
                                     ("--text-muted", "--text-bar-muted")):
            alt = token.get(stufe)
            gruende = _flaechen_fuer(token, leisten_token)
            if alt and not all(kontrast(alt, g) >= 4.5 for g in gruende):
                aenderungen.append((name, stufe, alt, naechster_wert(alt, gruende, 4.5)))

        # Am Akzent bewegt sich die Fläche, nicht die Schrift: Letztere ist oft
        # schon weiß oder schwarz, dann gibt es keine Richtung mehr.
        akzent, schrift = token.get("--accent"), token.get("--accent-contrast")
        if akzent and schrift and kontrast(akzent, schrift) < 4.5:
            aenderungen.append((name, "--accent", akzent, naechster_wert(akzent, [schrift], 4.5)))

    if not aenderungen:
        print(faerbe("Nichts zu tun — alle leisen Stufen halten 4.5:1.", GRUEN))
        return 0

    print(f"{'Theme':12} {'Token':20} {'vorher':>9} {'nachher':>9}")
    print("─" * 54)
    for name, stufe, alt, neu in aenderungen:
        print(f"{name:12} {stufe:20} {als_hex(alt):>9} {faerbe(als_hex(neu).rjust(9), GRUEN)}")
        if schreiben:
            text = _ersetze(text, name, stufe, neu)

    if schreiben:
        pfad.write_text(text, encoding="utf-8")
        print(faerbe(f"\n{len(aenderungen)} Werte geschrieben.", GRUEN))
    else:
        print(faerbe("\nProbelauf — mit --schreiben anwenden.", GELB))
    return 0


def _ersetze(text: str, theme: str, token: str, neu: Farbe) -> str:
    """Schreibt einen Token-Wert in den Block, der ihn tatsächlich enthält.

    Ein Theme-Name kann mehrfach in der Datei stehen — neben seiner Palette
    auch in Sammelselektoren wie
    `:root[data-theme='paper'], :root[data-theme='mono'] { --brand-word: … }`.
    Ein `search` trifft den erstbesten und schreibt ins Leere, ohne zu meckern.
    """
    muster = rf"(:root\[data-theme='{theme}'\]\s*\{{)([^}}]*)(\}})"
    treffer = [m for m in re.finditer(muster, text) if token in m.group(2)]
    if not treffer:
        raise ValueError(f"{theme}: {token} in keinem Block gefunden")

    block = treffer[0]
    ersetzt = re.sub(rf"({re.escape(token)}\s*:\s*)[^;]+;",
                     rf"\g<1>{neu[0]} {neu[1]} {neu[2]};", block.group(2))
    return text[:block.start(2)] + ersetzt + text[block.end(2):]


# ─── Ausgeben ───────────────────────────────────────────────────────────────

# Reihenfolge und Gruppierung der Zeilen im ausgegebenen Block. Bewusst fest
# und nicht nach Fundstelle: Nur so lassen sich zwei Stände — vor und nach
# einer Änderung — zeilenweise vergleichen. Ein Diff ist die halbe Prüfung.
AUSGABE_ZEILEN = [
    ("--surface-page", "--surface-card"),
    ("--surface-raised", "--surface-sunken"),
    ("--surface-header", "--surface-statusbar"),
    ("--text-primary", "--text-secondary", "--text-muted"),
    ("--text-bar", "--text-bar-secondary", "--text-bar-muted"),
    ("--border-default", "--border-subtle", "--border-bar"),
    ("--accent", "--accent-contrast"),
]


def befehl_export(pfad: Path) -> int:
    """Gibt die Paletten als Markdown-Blöcke auf die Standardausgabe.

    Der Grund für diesen Unterbefehl: Wer alle Werte im Zusammenhang lesen
    will, soll sie sich **erzeugen** statt sie irgendwo abzulegen. Eine
    abgelegte Liste läuft von der geprüften Datei weg und liefert dann genau
    die Werte, die hier gerade korrigiert wurden — so ist es einmal passiert,
    und deshalb gibt es die frühere `references/themes.md` nicht mehr.

    Ausgegeben werden nur die Werte, die ein Theme **selbst** setzt. Was über
    den Rückfall kommt, gehört nicht in die Palette — es stünde dort als
    Wiederholung und würde beim nächsten Abgleich als Unterschied gelesen.
    """
    roh_text = pfad.read_text(encoding="utf-8")
    _, roh = _bloecke(roh_text)

    for name in sorted(roh):
        eigene = {k: v for k, v in roh[name].items() if _TRIPEL.match(v)}
        if "--surface-page" not in eigene:
            continue  # kein Palettenblock, etwa ein Sammelselektor

        print(f"### {name}\n")
        print("```css")
        for gruppe in AUSGABE_ZEILEN:
            teile = [f"{token}: {eigene[token]};" for token in gruppe if token in eigene]
            if teile:
                print(" ".join(teile))
        print("```\n")
    return 0


# ─── Erzeugen ───────────────────────────────────────────────────────────────

FEST = """  --asset-stocks: 57 135 229;
  --asset-bonds: 213 81 129;
  --asset-metals: 201 133 0;
  --asset-moneymarket: 144 133 233;
  --asset-cash: 25 158 112;

  --status-ok: 25 158 112;
  --status-near: 217 119 6;
  --status-out: 224 82 82;"""


def befehl_build(pfad: Path) -> int:
    """Erzeugt einen Token-Block aus einer HSL-Vorgabe."""
    rezept = json.loads(pfad.read_text(encoding="utf-8"))
    name = rezept["name"]
    flaechen = {k: aus_hsl(*v) for k, v in rezept["surfaces"].items()}
    leisten = {k: aus_hsl(*v) for k, v in rezept.get("bars", {}).items()}
    raender = {k: aus_hsl(*v) for k, v in rezept.get("borders", {}).items()}
    ton = rezept.get("textHue", rezept["surfaces"]["page"][0])

    # Leiser Text wird gegen die *hellste* Fläche gelöst, auf der er vorkommt —
    # nicht nur gegen die Karte. Sonst trägt er auf Menüs oder einer hellen
    # Kopfzeile nicht, und die Regel sieht dort nicht hin.
    hellste = max(list(flaechen.values()) + list(leisten.values()), key=leuchtdichte)
    text = {
        "primary": aus_hsl(ton, 30, 96),
        "secondary": aus_hsl(ton, 14, loese_helligkeit(ton, 14, hellste, 6.0)),
        "muted": aus_hsl(ton, 10, loese_helligkeit(ton, 10, hellste, 4.5)),
    }

    akzent_ton = rezept["accent"]["hue"]
    akzent_saettigung = rezept["accent"]["saturation"]
    akzent = aus_hsl(akzent_ton, akzent_saettigung,
                     loese_helligkeit(akzent_ton, akzent_saettigung, flaechen["card"], 4.5))

    zeilen = [f":root[data-theme='{name}'] {{"]
    for schluessel in ("page", "card", "raised", "sunken"):
        zeilen.append(f"  --surface-{schluessel}: {' '.join(map(str, flaechen[schluessel]))};")
    if leisten:
        zeilen.append("")
        for schluessel in ("header", "statusbar"):
            if schluessel in leisten:
                zeilen.append(f"  --surface-{schluessel}: {' '.join(map(str, leisten[schluessel]))};")
    zeilen.append("")
    for schluessel, farbe in text.items():
        zeilen.append(f"  --text-{schluessel}: {' '.join(map(str, farbe))};")
    if leisten:
        bar = aus_hsl(ton, 10, loese_helligkeit(ton, 10, max(leisten.values(), key=leuchtdichte), 4.5))
        zeilen.append(f"  --text-bar-muted: {' '.join(map(str, bar))};")
    zeilen.append("")
    for schluessel, farbe in raender.items():
        zeilen.append(f"  --border-{schluessel}: {' '.join(map(str, farbe))};")
    zeilen.append("")
    zeilen.append(f"  --accent: {' '.join(map(str, akzent))};")
    zeilen.append(f"  --accent-contrast: {' '.join(map(str, flaechen['page']))};")
    zeilen.append("")
    zeilen.append(FEST)
    zeilen.append("}")

    print("\n".join(zeilen))
    print(f"\n{faerbe('Vorschau für themes.ts:', FETT)}")
    print(f"  page {als_hex(flaechen['page'])}  card {als_hex(flaechen['card'])}"
          f"  ink {als_hex(text['primary'])}  accent {als_hex(akzent)}")
    return 0


# ─── Einstieg ───────────────────────────────────────────────────────────────

BEISPIEL_REZEPT = """{
  "name": "mangolila",
  "textHue": 28,
  "surfaces": {
    "page":   [28, 6,  9],
    "card":   [28, 5, 13],
    "raised": [28, 5, 18],
    "sunken": [28, 7,  6]
  },
  "bars":    { "header": [28, 9, 22], "statusbar": [28, 8, 5] },
  "borders": { "default": [28, 6, 23], "subtle": [28, 6, 16], "bar": [28, 9, 31] },
  "accent":  { "hue": 19, "saturation": 79 }
}"""


def main() -> int:
    parser = argparse.ArgumentParser(
        prog="theme-tokens.py",
        description="Themes prüfen und erzeugen — nach den Grenzwerten in REGELN.",
        epilog=(
            "Beispiele:\n"
            "  theme-tokens.py check src/styles/tokens.css --zonen\n"
            "  theme-tokens.py repair src/styles/tokens.css            # Probelauf\n"
            "  theme-tokens.py repair src/styles/tokens.css --schreiben\n"
            "  theme-tokens.py export src/styles/tokens.css   # alle Paletten lesen\n"
            "  theme-tokens.py beispiel > rezept.json\n"
            "  theme-tokens.py build rezept.json >> src/styles/tokens.css\n\n"
            "`check` liefert Exit-Code 1, sobald ein harter Grenzwert reißt — damit\n"
            "taugt es als Make-Target oder Vor-dem-Commit-Prüfung.\n\n"
            "`build` und `repair` unterscheiden sich absichtlich: Beim Erzeugen werden\n"
            "beide leisen Textstufen gegen die hellste Fläche gelöst (6:1 und 4.5:1),\n"
            "beim Reparieren steht --text-secondary schon fest und nur --text-muted\n"
            "bewegt sich. Gegen --surface-raised zu lösen würde die beiden Stufen dort\n"
            "ineinanderlaufen lassen; das bleibt deshalb ein weicher Hinweis."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    unter = parser.add_subparsers(dest="befehl", required=True)

    p_check = unter.add_parser("check", help="Token-Datei gegen alle Grenzwerte messen")
    p_check.add_argument("datei", type=Path, help="SCSS- oder CSS-Datei mit den Token")
    p_check.add_argument("--zonen", action="store_true",
                         help="zusätzlich die Trennung von Kopf, Inhalt und Fuß ausgeben")

    p_repair = unter.add_parser("repair", help="leise Stufen bestehender Themes auf 4.5:1 anheben")
    p_repair.add_argument("datei", type=Path, help="SCSS- oder CSS-Datei mit den Token")
    p_repair.add_argument("--schreiben", action="store_true",
                          help="Änderungen anwenden statt nur anzeigen")

    p_export = unter.add_parser("export", help="alle Paletten als Markdown ausgeben")
    p_export.add_argument("datei", type=Path, help="SCSS- oder CSS-Datei mit den Token")

    p_build = unter.add_parser("build", help="Token-Block aus einer HSL-Vorgabe erzeugen")
    p_build.add_argument("rezept", type=Path, help="JSON-Datei, Aufbau siehe `beispiel`")

    unter.add_parser("beispiel", help="Beispiel-Rezept auf die Standardausgabe schreiben")

    args = parser.parse_args()

    try:
        if args.befehl == "check":
            return befehl_check(args.datei, args.zonen)
        if args.befehl == "repair":
            return befehl_repair(args.datei, args.schreiben)
        if args.befehl == "export":
            return befehl_export(args.datei)
        if args.befehl == "build":
            return befehl_build(args.rezept)
        print(BEISPIEL_REZEPT)
        return 0
    except FileNotFoundError as fehler:
        print(faerbe(f"Datei nicht gefunden: {fehler.filename}", ROT), file=sys.stderr)
        return 2
    except (json.JSONDecodeError, KeyError, ValueError) as fehler:
        print(faerbe(f"Rezept oder Werte unbrauchbar: {fehler}", ROT), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
