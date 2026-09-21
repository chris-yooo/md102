# MD-102 Endpoint Administrator Practice Assessment

React-basierte Single-Page-App (Vite + React 18) zur Vorbereitung auf die Microsoft MD-102 Prüfung (Endpoint Administrator Associate).

## Features

- **100-minütiger Simulationsmodus** mit Timer und Fortschrittsanzeige
- **28 Hauptfragen** aus dem offiziellen Microsoft Learn Blueprint (July 2026 Skill Update)
- **6 zusätzliche Community-verifizierte Fragen** von free-braindumps.com (Dieser Branch)
- **Fünf Prüfungsbereiche** abgedeckt:
  - Prepare Infrastructure for Devices (20–25%)
  - Manage and Maintain Devices (25–30%)
  - Protect Devices (15–20%)
  - Manage and Secure Applications (15–20%)
  - Optimize Endpoint Operations (10–15%)
- **Detailierte Erklärungen** nach jeder beantworteten Frage
- **Domain-basierte Auswertung** mit farbkodierten Balken (✅/⚠️/🔴)
- **Scoring-System**: 0–1000 Punkte (Pass-Grenze: 700)
- **Dunkles Microsoft Learn-Style-Design**

## Technologie-Stack

- Vite 5 + React 18 (Client-seitig, keine Backend-Komponente)
- Kein Backend, kein Server-side Rendering
- Produktions-Build als statische Dateien (`dist/`)
- Responsive Design (Desktop + Mobile)

## Setup

```bash
# 1. Dependencies installieren
npm install

# 2. Entwicklungsserver starten
npm run dev

# 3. Produktions-Build
npm run build

# 4. Preview des Builds
npm run preview
```

Der Entwicklungsserver läuft standardmäßig auf **http://localhost:3030/**.

## Projektstruktur

```
md102/
├── index.html              # Einstiegspunkt (Google Fonts: Inter)
├── package.json            # React 18, Vite 5
├── vite.config.js          # Port 3030, allowedHosts
├── src/
│   ├── main.jsx            # React 18 Entry Point (createRoot + StrictMode)
│   ├── App.jsx             # Hauptkomponente: Frage-Bank + Assessment-Logik (~950 Zeilen)
│   ├── index.css           # Styles (~20 KB, dunkles Microsoft Learn Theme)
│   └── question-bank-extra.js  # Zusätzliche Fragen (Community-verifiziert, externe Bank)
├── dist/                   # Produktions-Build-Ausgabe
│   ├── index.html
│   └── assets/
│       ├── index-…js       # Minimiertes JS Bundle
│       └── index-…css      # Minimiertes CSS Bundle
├── MD-102_Study_Guide.md   # Ausführlicher Studienleitfaden (Markdown)
├── scripts/
│   └── extract_braindump.py  # Tool zum Extrahieren von Fragen aus Markdown-Cache-Dateien
└── verify_build.mjs        # Build-Verifizierungsskript
```

## Frage-Banken

### Primäre Fragebank (`src/App.jsx`)
- **28 Fragen** direkt in `QUESTION_BANK` Array definiert
- Alle fünf Domains nach Microsoft-Skill-Measure abgedeckt
- Jede Frage: ID, Domain, Frage-Text, 4 Optionen, korrekte Antwort-Index, Erklärung

### Zusätzliche Fragebank (`src/question-bank-extra.js`)
- **6 Fragen** aus free-braindumps.com (Community-verifiziert, ohne Bilder/Hotspots)
- IDs: `BB-001` bis `BB-006`
- Werden aktuell **nicht** automatisch in die Haupt-App geladen (muss im Code manuell integriert werden)
- Stand: Dieser Branch enthält die Fragen bereits direkt in `App.jsx` eingebaut

## App-Logik (App.jsx)

Die Hauptkomponente verwaltet:
- **Drei Phasen**: `intro` → `exam` → `review`
- **State-Variablen**:
  - `phase` — aktueller Bildschirm-Modus
  - `index` — aktuelle Fragenummer (0-basiert)
  - `answers` — Objekt `{ [questionId]: selectedOptionIndex }`
  - `showExplanation` — ob Erklärung nach Antwort sichtbar
  - `timeRemaining` — Sekunden seit Prüfungsstart (default: 100 min = 6000 Sek)
  - `timerPaused` — Timer-Status

- **Scoring**:
  - `correctCount` — Anzahl richtiger Antworten
  - `scaledScore = Math.round((correctCount / TOTAL_QUESTIONS) * 1000)`
  - `passed = scaledScore >= 700`

- **Review-Screen** zeigt:
  - PASS/FAIL-Badge
  - Gesamtpunktzahl `/1000`
  - Korrigierte/Incorrect/Unanswered-Zählung
  - Tabellarische Domain-Aufschlüsselung mit Mini-Balken
  - Jede Frage mit ausklappbarer Erklärung

## Hinweis zu zusätzlichen Fragen

Die Datei `src/question-bank-extra.js` enthält eine externe Fragebank (`EXTRA_QUESTION_BANK`), die nicht automatisch in `App.jsx` geladen wird. Um sie zu integrieren, müsste in `App.jsx`:

1. `import { EXTRA_QUESTION_BANK } from './question-bank-extra.js';`
2. In der `QUESTION_BANK`-Definion oder einer zentralen Merge-Stelle: `const FULL_BANK = [...QUESTION_BANK, ...EXTRA_QUESTION_BANK];`
3. `TOTAL_QUESTIONS` entsprechend aktualisieren

## Autor

Projekt von chris-yooo.  
Zertifizierungsvorbereitung — nicht offiziell mit Microsoft verbunden.

## Lizenz

Keine spezifische Lizenz festgelegt. Nauftrags- bzw. private Nutzung.
