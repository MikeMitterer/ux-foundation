#!/usr/bin/env bash
#------------------------------------------------------------------------------
# setup-libs.sh — Legt Symlinks unter .libs/ zu den zentralen Repos an
#
# BashLib, MakeLib und ProjectTools sind zentrale Konventions-Repos. Dieses
# Script verlinkt sie ins Projekt (nicht kopieren), damit alle Scripts und das
# Makefile mit denselben Versionen arbeiten wie systemweit.
#
# Welche verlinkt werden, steht in genau einer Liste — siehe LIBS weiter unten.
#
# Verwendung:
#   ./scripts/setup-libs.sh [--install|--info|--help]
#   make setup
#
# Optionen:
#   -i | --install   Symlinks anlegen (idempotent — überschreibt vorhandene)
#        --info      Aktuelle Verlinkung anzeigen
#   -h | --help      Diese Hilfe anzeigen
#------------------------------------------------------------------------------

set -euo pipefail

BASH_LIBS="${BASH_LIBS:-$(cd "$(dirname "$0")/.." && pwd)/.libs/BashLib/src}"

# BashLib einbinden — mit Guard, damit doppelt-Sourcen unschädlich ist
if [[ "${__COLORS_LIB__:=""}"  == "" ]] && [[ -f "${BASH_LIBS}/colors.lib.sh" ]]; then
    . "${BASH_LIBS}/colors.lib.sh"
fi
if [[ "${__TOOLS_LIB__:=""}"   == "" ]] && [[ -f "${BASH_LIBS}/tools.lib.sh" ]]; then
    . "${BASH_LIBS}/tools.lib.sh"
fi

# Fallback-Farben (falls BashLib beim allerersten Setup noch nicht verlinkt ist)
: "${RED:=$(printf '\033[38;5;196m')}"
: "${GREEN:=$(printf '\033[38;5;10m')}"
: "${YELLOW:=$(printf '\033[38;5;11m')}"
: "${BLUE:=$(printf '\033[38;5;33m')}"
: "${CYAN:=$(printf '\033[38;5;51m')}"
: "${LIGHT_BLUE:=$(printf '\033[38;5;45m')}"
: "${NC:=$(printf '\033[0m')}"

readonly APPNAME="$(basename "$0")"
readonly PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
readonly LIBS_DIR="${PROJECT_ROOT}/.libs"

# Quellen aus den Env-Variablen ableiten. `BASH_LIBS` und `PROJECT_TOOLS`
# zeigen üblicherweise auf .../<Repo>/src — verlinkt wird aber das Repo-Root,
# also eine Ebene höher. `DEV_MAKE` zeigt bereits dorthin.
readonly BASHLIB_REPO="$(cd "${BASH_LIBS%/src}" 2>/dev/null && pwd || true)"
readonly MAKELIB_REPO="${DEV_MAKE:-}"
# `${VAR:+…}` statt `${VAR:-}`: Bei leerem PROJECT_TOOLS bliebe sonst `cd "/.."`
# übrig — das gelingt und liefert die Wurzel, die dann verlinkt würde.
readonly PROJECTTOOLS_REPO="${PROJECT_TOOLS:+$(cd "${PROJECT_TOOLS%/src}" 2>/dev/null && pwd || true)}"

# Die verlinkten Repos — eine Zeile je Symlink, damit ein weiteres nicht einen
# weiteren Codeblock nach sich zieht:
#   <Name>|<Quelle>|<Env-Variable>|<worauf die Variable zeigen soll>
readonly LIBS=(
    "BashLib|${BASHLIB_REPO}|BASH_LIBS|.../BashLib/src"
    "MakeLib|${MAKELIB_REPO}|DEV_MAKE|.../MakeLib"
    "ProjectTools|${PROJECTTOOLS_REPO}|PROJECT_TOOLS|.../ProjectTools/src"
)

# Breite der Namensspalte in den Ausgaben — am längsten Namen ausgerichtet.
readonly NAME_SPALTE=13

usage() {
    echo
    echo "Usage: ${APPNAME} [ options ]"
    echo
    if command -v usageLine >/dev/null 2>&1; then
        usageLine "-i | --install         " "Symlinks unter ${YELLOW}.libs/${NC} anlegen (idempotent)"
        usageLine "     --info            " "Aktuelle Verlinkung anzeigen"
        usageLine "-h | --help            " "Diese Hilfe anzeigen"
    else
        printf "    ${CYAN}%-24s${NC} %s\n" "-i | --install" "Symlinks unter ${YELLOW}.libs/${NC} anlegen (idempotent)"
        printf "    ${CYAN}%-24s${NC} %s\n" "     --info"    "Aktuelle Verlinkung anzeigen"
        printf "    ${CYAN}%-24s${NC} %s\n" "-h | --help"    "Diese Hilfe anzeigen"
    fi
    echo
    echo -e "${LIGHT_BLUE}Hints:${NC}"
    echo -e "    Symlinks anlegen: ${GREEN}${APPNAME} --install${NC}"
    echo -e "    Status prüfen:    ${GREEN}${APPNAME} --info${NC}"
    echo
    echo -e "${LIGHT_BLUE}Voraussetzungen:${NC}"
    local _eintrag _name _quelle _env
    for _eintrag in "${LIBS[@]}"; do
        IFS='|' read -r _name _quelle _env _ <<< "${_eintrag}"
        printf "    ${YELLOW}%-14s${NC} → ${BLUE}%s${NC}\n" "${_env}" "${!_env:-<nicht gesetzt>}"
    done
    echo
}

# Verlinkt <src> nach <dst>, überschreibt bestehende Symlinks.
#
# Params:
#   $1 - Quell-Verzeichnis (absoluter Pfad, muss existieren)
#   $2 - Ziel-Symlink (wird angelegt/überschrieben)
#
# Returns:
#   0 wenn erfolgreich, 1 wenn Quelle fehlt
linkOnce() {
    local -r _src="$1"
    local -r _dst="$2"

    if [[ ! -d "${_src}" ]]; then
        return 1
    fi

    mkdir -p "$(dirname "${_dst}")"
    rm -f "${_dst}"
    ln -s "${_src}" "${_dst}"
}

cmd_install() {
    local _rc=0

    echo
    echo -e "${CYAN}▶ Symlinks anlegen unter ${YELLOW}${LIBS_DIR}${NC}"
    echo

    local _eintrag _name _quelle _env _erwartet
    for _eintrag in "${LIBS[@]}"; do
        IFS='|' read -r _name _quelle _env _erwartet <<< "${_eintrag}"

        if [[ -z "${_quelle}" || ! -d "${_quelle}" ]]; then
            echo -e "${RED}✗ ${_name}-Repo nicht gefunden${NC}" >&2
            # `${!_env}` liest die Variable, deren *Name* in _env steht.
            echo -e "  ${YELLOW}Tipp:${NC} ${YELLOW}${_env}${NC} soll auf ${_erwartet} zeigen — aktuell: ${BLUE}${!_env:-<leer>}${NC}" >&2
            _rc=1
            continue
        fi

        linkOnce "${_quelle}" "${LIBS_DIR}/${_name}" && \
            printf "  ${GREEN}✓${NC} %-${NAME_SPALTE}s → ${BLUE}%s${NC}\n" "${_name}" "${_quelle}"
    done

    echo

    if [[ ${_rc} -ne 0 ]]; then
        echo -e "${RED}Setup fehlgeschlagen. Env-Variablen prüfen und erneut versuchen.${NC}" >&2
        exit ${_rc}
    fi

    echo -e "${GREEN}✓ Setup fertig${NC}"
    echo
}

cmd_info() {
    echo
    echo -e "${CYAN}▶ Aktuelle Verlinkung${NC}"
    echo

    local _eintrag _name _path _target
    for _eintrag in "${LIBS[@]}"; do
        _name="${_eintrag%%|*}"
        _path="${LIBS_DIR}/${_name}"

        if [[ -L "${_path}" ]]; then
            _target="$(readlink "${_path}")"
            if [[ -d "${_target}" ]]; then
                printf "  ${GREEN}✓${NC} %-${NAME_SPALTE}s → ${BLUE}%s${NC}\n" "${_name}" "${_target}"
            else
                printf "  ${YELLOW}⚠${NC} %-${NAME_SPALTE}s → ${BLUE}%s${NC} ${RED}(Ziel fehlt)${NC}\n" "${_name}" "${_target}"
            fi
        elif [[ -e "${_path}" ]]; then
            printf "  ${YELLOW}⚠${NC} %-${NAME_SPALTE}s — existiert, ist aber kein Symlink\n" "${_name}"
        else
            printf "  ${RED}✗${NC} %-${NAME_SPALTE}s — nicht verlinkt\n" "${_name}"
        fi
    done
    echo
}

# Kein Argument → Help anzeigen (keine Ausnahmen)
if [[ $# -eq 0 ]]; then
    usage
    exit 0
fi

case "$1" in
    -i|--install) cmd_install ;;
       --info)    cmd_info ;;
    -h|--help)    usage; exit 0 ;;
    *)
        echo -e "${RED}Unbekannte Option: $1${NC}" >&2
        usage
        exit 1
        ;;
esac
