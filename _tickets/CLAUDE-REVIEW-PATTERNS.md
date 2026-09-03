# Claude-Review-Muster

Diese Datei sammelt wiederkehrende, verallgemeinerbare Fehlermuster aus den
Codex-Reviews dieses Repos. Sie ist die dauerhafte Lernschicht; einzelne
Ticketfehler bleiben im Ticket und in git.

Ein Muster wird erst aufgenommen, wenn mindestens zwei unabhängige Belege
vorliegen oder eine ausdrückliche Vollständigkeitsbehauptung nachweislich falsch
war. Jeder Eintrag enthält:

1. **Erkennungsregel** — woran der Reviewer das Muster findet.
2. **Prüffrage** — welche konkrete Gegenprobe es widerlegt oder bestätigt.
3. **Belege** — Ticket, Review-Runde, Commit und knappe Beobachtung.

Die Datei wird vor jedem inhaltlichen Review vollständig gelesen. Sie enthält
keine offene Arbeitsliste und keine unbestätigten Vermutungen.

## Übersicht

### Vollständige Sprachumschaltung endet nicht am Dokumentrand

**Erkennungsregel:** Sobald ein Showcase sichtbare Inhalte in iframes oder
anderen eigenständigen Browsing-Kontexten rendert, ist eine persistierte Locale
noch keine synchronisierte Locale. Jede dort erzeugte i18n-Instanz hat eigenen
reaktiven Zustand. Eine Aussage wie „alle sichtbaren Texte wechseln" ist erst
belegt, wenn diese Kontexte einbezogen wurden.

**Prüffrage:** Sekundärkontext zuerst vollständig laden, dann die Sprache im
Hauptdokument ohne Reload wechseln. Folgen sichtbarer Text und das jeweilige
`document.documentElement.lang` in Haupt- und Sekundärkontexten gemeinsam?

**Beleg:** T-17, Review-Runde 1, Handoff `2175058`: Die drei bereits geladenen
`?demo=nav`-iframes besitzen je eine eigene i18n-Instanz. Der Eltern-Umschalter
ändert nur den Eltern-Ref und `localStorage`; Listener, Nachricht oder Reload
fehlen. Trotzdem beanspruchten Verify #5 und #15 vollständig umgeschaltete
sichtbare Texte.
