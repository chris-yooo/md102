# MD-102 Endpoint Administrator Practice Assessment

React-basierte Single-Page-App (Vite + React 18) zur Vorbereitung auf die Microsoft MD-102 Prüfung (Endpoint Administrator Associate).

## Features

- **100-minütiger Simulationsmodus** mit Timer und Fortschrittsanzeige
- **34 Fragen** insgesamt (28 aus dem offiziellen Microsoft Learn Blueprint + 6 Community-verifizierte Fragen)
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
│   ├── App.jsx             # Hauptkomponente: Frage-Bank + Assessment-Logik (~1027 Zeilen)
│   │                         Enthält: QUESTION_BANK (34 Fragen inkl. 6 Community-Fragen)
│   ├── index.css           # Styles (~20 KB, dunkles Microsoft Learn Theme)
│   └── question-bank-extra.js  # Externe Fragebank (experimentell, nicht integriert)
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

### Primäre Fragebank (`src/App.jsx` — `QUESTION_BANK`)

Die Hauptfragebank mit **34 Fragen** inklusive:

**28 originale Fragen** (aus offiziellen Microsoft Learn Modulen und Blueprint-Dokumenten):
- D1-01 bis D1-08: Prepare Infrastructure for Devices
- D2-01 bis D2-07: Manage and Maintain Devices
- D3-01 bis D3-07: Protect Devices
- D4-01 bis D4-07: Manage and Secure Applications
- D5-01 bis D5-07: Optimize Endpoint Operations

**6 Community-verifizierte Fragen** (aus free-braindumps.com, ohne Bilder/Hotspots):
- D1-09: Autopilot CSV-Import (Hardware-ID)
- D1-10: Android Enterprise Work Profile Enrollment Restrictions
- D1-11: Delivery Optimization Download Mode
- D1-12: Defender for Endpoint Onboarding (EDR Policy)
- D2-08: Intune Connector for AD — Computer-Objekt erstellen
- D3-08: Android Work Profile Enrollment Restrictions (identisch mit D1-10, anderes Question Set)

### Zusätzliche Fragebank (`src/question-bank-extra.js` — `EXTRA_QUESTION_BANK`)

Experimentelle externe Fragebank. **Nicht automatisch integriert** — muss manuell in `App.jsx` importiert und in die Hauptfragebank eingefügt werden. Aktuell leer (Parser-Fehler beim Extrahieren aus Cache-Dateien).

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

## Entwicklung

### Branch-Strategie

- **main**: Produktions-branch mit stabilen Features
- **feature/***: Feature-branches für neue Funktionalität

Änderungen werden **nie direkt auf main** committed. Jede Änderung erstellt einen Feature-Branch, wird gepusht, und erst nach expliziter Genehmigung gemergt.

### Aktuelle Branches

| Branch | Status | Beschreibung |
|--------|--------|--------------|
| `main` | ✅ Produktiv | Basis-Version mit 28 Fragen |
| `feature/braindump-questions` | 🟡 Feature | 6 zusätzliche Fragen (älterer Versuch, nicht aktiv) |
| `feature/braindump-questions-from-free-braindumps` | ✅ Aktuell | Dieser Branch mit 6 neuen Fragen + README für Branch |

### Wie man einen neuen Feature-Branch erstellt

```bash
# 1. Auf main wechseln und aktualisieren
git checkout main
git pull origin main

# 2. Neuen Feature-Branch erstellen
git checkout -b feature/meine-änderung

# 3. Änderungen machen, committen, pushen
git add .
git commit -m "feat: beschreibung der änderung"
git push -u origin feature/meine-änderung

# 4. NACH Genehmigung: Merge auf main
git checkout main
git merge feature/meine-änderung
git push origin main
git branch -d feature/meine-änderung
```

## Nicht integrierte Features (Known Issues)

- **Hotspot / Drag-Drop Fragen**: Die App unterstützt nur Multiple-Choice-Fragen. Fragen mit Bildern, Hotspots oder Drag-Drop-Funktionen aus Brain-Dump-Quellen können nicht dargestellt werden und werden ausgelassen.
- **Externe Fragebank-Integration**: `question-bank-extra.js` ist vorhanden, aber nicht automatisch geladen.
- **Frage-Overlap**: Einige Fragen aus verschiedenen Quellen können inhaltlich ähnlich sein (z.B. D1-10 und D3-08).

## Lizenz

Keine spezifische Lizenz festgelegt. Private Nutzung.
