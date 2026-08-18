SHELL := /bin/bash

.DEFAULT_GOAL := help

WORKSPACE    := $(realpath $(shell pwd))
PROJECT_NAME := $(notdir $(WORKSPACE))

-include ${DEV_MAKE}/colours.mk
-include ${DEV_MAKE}/tools.mk

# Fallback-Farben wenn DEV_MAKE nicht gesetzt ist (z.B. im CI-Container)
YELLOW ?= $(shell printf "\033[38;5;11m")
GREEN  ?= $(shell printf "\033[38;5;10m")
BLUE   ?= $(shell printf "\033[38;5;33m")
ORANGE ?= $(shell printf "\033[38;5;208m")
RED    ?= $(shell printf "\033[38;5;196m")
WHITE  ?= $(shell printf "\033[38;5;15m")
RESET  ?= $(shell printf "\033[0m")
NC     ?= $(shell printf "\033[0m")
THEME_COLOR_GROUP   ?= $(YELLOW)
THEME_COLOR_TARGET  ?= $(BLUE)
THEME_COLOR_DESC    ?= $(GREEN)
THEME_COLOR_SERVER  ?= $(ORANGE)
THEME_COLOR_DANGER  ?= $(RED)
THEME_INDENT_GROUP  ?= $(shell printf '%2s' '')
THEME_INDENT_TARGET ?= $(shell printf '%7s' '')

# Geteilte Check-Scripte für `make status`. `PROJECT_TOOLS` ist ein
# System-Setting wie DEV_MAKE und BASH_LIBS und wird vorausgesetzt — der
# Rückfall auf den Symlink deckt nicht-interaktive Shells ab, die kein
# Profil einlesen (Jenkins). Angelegt wird er von `make setup`.
PROJECT_TOOLS ?= $(WORKSPACE)/.libs/ProjectTools/src

# ─── Hilfe ───────────────────────────────────────────────────────────────────

.PHONY: help
help: ## Alle verfügbaren Befehle anzeigen
	@echo
	@echo "Please use \`make <$(THEME_COLOR_GROUP)target$(RESET)>' where <target> is one of"
	@echo
	@echo "Project: $(THEME_COLOR_GROUP)$(PROJECT_NAME)$(RESET)"
	@echo
	@grep -hE '^(##@|[a-zA-Z0-9_-]+:.*?##[RD]? )' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*##[RD]? "}; \
	    /^##@/ { printf "\n$(THEME_INDENT_GROUP)$(THEME_COLOR_GROUP)%s$(RESET)\n", substr($$0, 4); next }; \
	    /##D /  { printf "$(THEME_INDENT_TARGET)$(THEME_COLOR_DANGER)%-22s $(THEME_COLOR_DESC)%s$(RESET)\n", $$1, $$2; next }; \
	    /##R /  { printf "$(THEME_INDENT_TARGET)$(THEME_COLOR_SERVER)%-22s $(THEME_COLOR_DESC)%s$(RESET)\n", $$1, $$2; next }; \
	    /## /   { printf "$(THEME_INDENT_TARGET)$(THEME_COLOR_TARGET)%-22s $(THEME_COLOR_DESC)%s$(RESET)\n", $$1, $$2 }'
	@echo
	@echo "  $(THEME_COLOR_TARGET)■$(RESET) lokal   $(THEME_COLOR_SERVER)■$(RESET) veröffentlicht in die Registry"
	@echo

.PHONY: info
info: ## Umgebungsvariablen anzeigen
	@echo
	@echo "    $(YELLOW)PROJECT_NAME$(RESET) = $(BLUE)$(PROJECT_NAME)$(RESET)"
	@echo "    $(YELLOW)WORKSPACE$(RESET)    = $(BLUE)$(WORKSPACE)$(RESET)"
	@echo "    $(YELLOW)DEV_MAKE$(RESET)     = $(BLUE)$${DEV_MAKE:-<nicht gesetzt>}$(RESET)"
	@echo "    $(YELLOW)BASH_LIBS$(RESET)    = $(BLUE)$${BASH_LIBS:-<nicht gesetzt>}$(RESET)"
	@echo "    $(YELLOW)PROJECT_TOOLS$(RESET)= $(BLUE)$(PROJECT_TOOLS)$(RESET)"
	@echo "    $(YELLOW)Paket$(RESET)        = $(BLUE)$$(node -p "require('./package.json').name" 2>/dev/null)$(RESET)"
	@echo

.PHONY: hints
hints: ## Nützliche Links und Hinweise anzeigen
	@echo
	@echo "  $(YELLOW)Schaufenster$(RESET)"
	@echo
	@printf "    $(BLUE)%-14s$(RESET) $(WHITE)%s$(RESET)\n" "dev"     "http://localhost:5177"
	@printf "    $(BLUE)%-14s$(RESET) $(WHITE)%s$(RESET)\n" "preview" "http://localhost:4177"
	@echo
	@echo "  $(YELLOW)Nachbar-Ports$(RESET)"
	@echo
	@printf "    $(BLUE)%-14s$(RESET) $(WHITE)%s$(RESET)\n" "StockInfo"      "http://localhost:5173"
	@printf "    $(BLUE)%-14s$(RESET) $(WHITE)%s$(RESET)\n" "StockPortfolio" "http://localhost:5175"
	@echo
	@echo "  $(YELLOW)Einbinden in eine App$(RESET)"
	@echo
	@echo "    $(WHITE)npm i $$(node -p "require('./package.json').name" 2>/dev/null)$(RESET)"
	@echo
	@echo "  $(YELLOW)Regeln und Begründungen$(RESET)"
	@echo
	@echo "    $(WHITE)ux-standards-Skill — was hier liegt, ist urteilsfrei; die$(RESET)"
	@echo "    $(WHITE)Entscheidungen stehen dort.$(RESET)"
	@echo

# ─── Precheck ────────────────────────────────────────────────────────────────

precheck: ## Umgebung prüfen — BASH_LIBS gesetzt?
	@if [[ -z "$${BASH_LIBS+x}" ]]; then \
		echo ""; \
		echo "$(RED)Achtung: '$(YELLOW)BASH_LIBS$(RED)' ist nicht gesetzt!$(RESET)"; \
		echo ""; \
		exit 1; \
	fi

##@ Setup

.PHONY: setup
setup: ## Symlinks (.libs/) + Abhängigkeiten installieren
	@./scripts/setup-libs.sh --install
	@npm install --no-audit --no-fund

##@ Status

# Die Logik liegt in ProjectTools, nicht hier: Was „Status" heißt, ist über
# alle Projekte dasselbe. Dieses Makefile setzt nur zusammen, welche Checks
# dieses Projekt braucht — hier genau einer, weil es ein einzelnes Repo ohne
# laufende Dienste ist. Kommt ein Netzwerk-Check dazu, steht er als zweite
# Zeile darunter.

.PHONY: status
status: ## Projekt-Status — Repo und offene Issues
	@bash $(PROJECT_TOOLS)/bash/repo-status.sh --show

##@ Entwicklung

.PHONY: dev
dev: ## Schaufenster starten (Port 5177)
	@npm run dev

.PHONY: build
build: ## Schaufenster bauen (typecheck + vite build)
	@npm run build

.PHONY: preview
preview: ## Gebautes Schaufenster ansehen (Port 4177)
	@npm run preview

.PHONY: lint
lint: ## ESLint über src/, showcase/
	@npm run lint

.PHONY: typecheck
typecheck: ## vue-tsc über Fundament und Schaufenster
	@npm run typecheck

.PHONY: test
test: ## Vitest — einmalig
	@npm run test

.PHONY: test-watch
test-watch: ## Vitest — Watch-Modus
	@npm run test-watch

.PHONY: clean
clean: ## dist-showcase/, .vite/, Build-Info löschen
	@rm -rf dist-showcase .vite showcase/*.tsbuildinfo *.tsbuildinfo
	@echo "$(GREEN)aufgeräumt$(RESET)"

# ─── Themes ──────────────────────────────────────────────────────────────────
#
# Hier stand einmal `check-themes`. Der Kontrast-Check ist kein eigenes Target
# mehr, sondern läuft in `make test` mit — `tests/themeContrast.spec.ts` ruft
# dasselbe Skript auf und liest seinen Exit-Code. Ein Wächter, den man von Hand
# starten muss, läuft irgendwann nicht mehr; die Verstöße aus T-14 standen
# monatelang in der Datei, während der Lauf grün gemeldet hätte.
#
# Die selteneren Unterbefehle haben weiterhin kein Target — sie haben eine
# eigene ordentliche Kommandozeile, und eine Übersetzungsschicht zwischen zwei
# Optionsnamen ist schlechter als gar keine:
#
#   python3 scripts/theme-tokens.py --help
#   python3 scripts/theme-tokens.py check src/styles/tokens.css --zonen

##@ Veröffentlichen

.PHONY: publish-dry
publish-dry: ## Zeigt, was veröffentlicht würde — ohne es zu tun
	@npm publish --dry-run

# Die Anmeldung steht **vor** dem Sicherheitscheck nicht, sondern dahinter:
# Erst wenn CONFIRM=yes gesetzt ist, soll überhaupt ein Browser aufgehen.
#
# `npm-login.sh --ensure` meldet an, falls nötig, statt es nur anzumahnen. Ohne
# das endet `npm publish` bei einem privaten Paket mit `404 Not Found` statt
# `401` — die Registry verrät dessen Existenz nicht, und die Meldung zeigt dann
# auf den Paketnamen statt auf den abgelaufenen Token.
.PHONY: publish
publish: ##R Paket in die private Registry veröffentlichen  [CONFIRM=yes]
	@test "$(CONFIRM)" = "yes" || \
	  (echo "$(ORANGE)Sicherheitscheck: make $@ CONFIRM=yes$(NC)" && exit 1)
	@bash $(PROJECT_TOOLS)/bash/npm-login.sh --ensure
	@npm publish

##@ Versionierung

.PHONY: version
# Gelesen wird über `readProjectVersion`, nicht mit `node -p` aus der
# package.json. Die Lib kennt die Reihenfolge der Versionsdateien
# (package.json → pyproject.toml → VERSION) und ist dieselbe Quelle, aus der
# auch `tag-*` schreibt. Eine eigene Extraktion hier wäre eine zweite Quelle,
# die genau dann falsch liegt, wenn es darauf ankommt.
version: ## Aktuelle Version anzeigen (Versionsdatei + git tag)
	@echo
	@VER=$$(source "$${BASH_LIBS}/version.lib.sh" 2>/dev/null && readProjectVersion 2>/dev/null); \
	 [[ -z "$$VER" ]] && VER='nicht gesetzt'; \
	 TAG=$$(git describe --tags --abbrev=0 2>/dev/null || echo 'kein Tag'); \
	 echo "    $(YELLOW)version$(RESET)  = $(BLUE)$$VER$(RESET)"; \
	 echo "    $(YELLOW)git tag$(RESET)  = $(BLUE)$$TAG$(RESET)"
	@echo

.PHONY: tags
tags: ## Letzte 10 Tags anzeigen
	@echo
	@git tag --sort=-version:refname -n1 | head -10 | \
	  awk '{printf "    \033[34m%-28s\033[0m \033[32m%s\033[0m\n", $$1, substr($$0, index($$0,$$2))}'
	@echo

.PHONY: tag-major
tag-major: precheck ## Version hochzählen — Major (X.y.z → X+1.0.0)  [MSG="..."]
	source "$${BASH_LIBS}/version.lib.sh" && semVerBump major auto "" "$${MSG:-}"

.PHONY: tag-minor
tag-minor: precheck ## Version hochzählen — Minor (x.Y.z → x.Y+1.0)  [MSG="..."]
	source "$${BASH_LIBS}/version.lib.sh" && semVerBump minor auto "" "$${MSG:-}"

.PHONY: tag-patch
tag-patch: precheck ## Version hochzählen — Patch (x.y.Z → x.y.Z+1)  [MSG="..."]
	source "$${BASH_LIBS}/version.lib.sh" && semVerBump patch auto "" "$${MSG:-}"
