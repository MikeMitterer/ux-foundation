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

TOKENS := src/styles/tokens.css

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

##@ Themes

# Nur der Check ist ein Target: Er läuft regelmäßig und gehört deshalb in
# `make help`, wo man ihn findet. `repair` und `export` laufen selten, haben
# eine eigene ordentliche Kommandozeile und würden hier nur eingewickelt —
# eine Übersetzungsschicht zwischen zwei Optionsnamen ist schlechter als gar
# keine. Für beides: `python3 scripts/theme-tokens.py --help`.

.PHONY: check-themes
check-themes: ## Alle Paletten gegen die Grenzwerte messen
	@python3 scripts/theme-tokens.py check $(TOKENS) --zonen

##@ Veröffentlichen

.PHONY: publish-dry
publish-dry: ## Zeigt, was veröffentlicht würde — ohne es zu tun
	@npm publish --dry-run

.PHONY: publish
publish: ##R Paket in die private Registry veröffentlichen  [CONFIRM=yes]
	@test "$(CONFIRM)" = "yes" || \
	  (echo "$(ORANGE)Sicherheitscheck: make $@ CONFIRM=yes$(NC)" && exit 1)
	@npm publish

##@ Versionierung

.PHONY: version
version: ## Aktuelle Version anzeigen (package.json + git tag)
	@echo
	@VER=$$(node -p "require('./package.json').version" 2>/dev/null); \
	 [[ -z "$$VER" ]] && VER='nicht gesetzt'; \
	 TAG=$$(git describe --tags --abbrev=0 2>/dev/null || echo 'kein Tag'); \
	 echo "    $(YELLOW)VERSION$(RESET)  = $(BLUE)$$VER$(RESET)"; \
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
