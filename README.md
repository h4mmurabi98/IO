# IO – Support Platform

Webbasierte Community-Plattform zur Incentivierung von Unterstützungsleistungen.  
Bachelorarbeit von Abdullah.

> Der Name leitet sich vom Support-Charakter IO aus Dota 2 ab, dessen einzige Aufgabe es ist, Teammates zu unterstützen.

---

## Konzept

Nutzer können Hilfegesuche einstellen (Seeker) oder annehmen (Supporter). Wer hilft, sammelt Punkte und steigt in der Rangliste auf. Das System basiert auf Gamification-Prinzipien: Punkte, Stufen (0–100), Abzeichen und Prämien.

**Rollen**

| Rolle     | Beschreibung                                       |
| --------- | -------------------------------------------------- |
| Gast      | Kann Hilfegesuche lesen, kann sich registrieren    |
| Seeker    | Angemeldeter Nutzer, der ein Hilfegesuch erstellt  |
| Supporter | Angemeldeter Nutzer, der ein Hilfegesuch übernimmt |

---

## Tech-Stack

**Frontend** (`/src`)

- React 18 + TypeScript
- Vite 5
- CSS Modules (kein Tailwind, keine Inline-Styles)

**Backend** (`/backend/src`)

- Node.js + Express
- MongoDB + Mongoose
- JWT-Authentifizierung (kein Session-Handling)

---

## Projektstruktur

```
IO/
├── src/                        # React Frontend
│   ├── assets/                 # Logo-SVGs (logo.svg, logo-light.svg)
│   ├── components/             # Navbar, TaskCard
│   ├── contexts/               # AuthContext
│   ├── hooks/                  # useTheme
│   ├── lib/                    # API-Client (api.ts)
│   ├── pages/                  # Eine Datei pro Route
│   ├── styles/                 # CSS-Variablen, globaler Reset
│   └── types/                  # Gemeinsame TypeScript-Typen
└── backend/
    └── src/
        ├── config/             # Mongoose-Verbindung
        ├── middleware/         # JWT-Auth-Middleware
        ├── models/             # User, Task, SupporterOffer
        ├── routes/             # auth, tasks, users, supporterOffers
        ├── utils/              # calculateLevel, Punkt-Logik
        └── seed.ts             # Testdaten-Skript
```

---

## Features

- **Hilfegesuche** — erstellen, filtern (nach Kategorie), annehmen, abschließen
- **Supporter-Einladungen** — Seeker kann bis zu 3 Supporter direkt einladen
- **Timer-Flow** — „Hilfe beginnen" startet einen lokalen Timer; „Abschließen" wird nach 80 % der Schätzzeit aktiv
- **Punkte & Stufen** — 100 Stufen, je 100 Punkte; `pointValue = difficulty × durationMinutes`
- **Supporter-Angebote** — Supporter können eigene Angebote posten; Abschluss = +30 Punkte
- **Leaderboard** — Top 10, filterbar nach Land / Bundesland / Bezirk / Nachbarschaft / Freunde; Podium für Plätze 1–3
- **Freundesliste** — Freunde hinzufügen/entfernen für den Freundes-Filter
- **Profil** — Seeker-Stats & Supporter-Stats getrennt, Avatar (base64), echter Name
- **Öffentliche Profile** — `/users/:id` für jeden Nutzer einsehbar
- **Prämien** — statische Prämienliste, Level schaltet bessere Deals frei (100 Pkt ≈ 1 €)
- **Light- / Dark-Mode** — umschaltbar; Logo wechselt automatisch (mono-dark / mono-light)

**Kategorien**

`Geistig` · `Körperlich` · `Haushalt & Handwerk` · `Digital & Technik` · `Talent & Kreativität` · `Sozial & Kommunikation`

---

## Routen (Frontend)

| Route          | Seite                                        | Auth       |
| -------------- | -------------------------------------------- | ---------- |
| `/`            | Landing Page (Gast) / Dashboard (eingeloggt) | –          |
| `/login`       | Login                                        | –          |
| `/register`    | Registrierung                                | –          |
| `/tasks`       | Hilfegesuche-Übersicht                       | – (lesend) |
| `/tasks/new`   | Neues Hilfegesuch                            | ✓          |
| `/tasks/:id`   | Hilfegesuch-Detail                           | –          |
| `/supporters`  | Supporter-Board + Angebote                   | –          |
| `/leaderboard` | Rangliste                                    | ✓          |
| `/rewards`     | Prämien                                      | ✓          |
| `/profile`     | Eigenes Profil                               | ✓          |
| `/users/:id`   | Öffentliches Profil                          | –          |

---

## API-Endpunkte

### Auth

| Method | Endpoint             | Beschreibung                | Auth |
| ------ | -------------------- | --------------------------- | ---- |
| POST   | `/api/auth/register` | Registrierung → JWT         | –    |
| POST   | `/api/auth/login`    | Login → JWT                 | –    |
| GET    | `/api/auth/me`       | Eigenes Profil + Stats      | ✓    |
| PUT    | `/api/auth/profile`  | Name + Avatar aktualisieren | ✓    |

### Tasks

| Method | Endpoint                  | Beschreibung                               | Auth |
| ------ | ------------------------- | ------------------------------------------ | ---- |
| GET    | `/api/tasks`              | Offene Gesuche, `?categories=`             | –    |
| POST   | `/api/tasks`              | Neues Gesuch (`pointValue` wird berechnet) | ✓    |
| GET    | `/api/tasks/:id`          | Einzelnes Gesuch                           | –    |
| PUT    | `/api/tasks/:id/assign`   | Gesuch annehmen                            | ✓    |
| PUT    | `/api/tasks/:id/complete` | Abschließen + Punkte/Level                 | ✓    |

### Users

| Method | Endpoint                     | Beschreibung                                                     | Auth |
| ------ | ---------------------------- | ---------------------------------------------------------------- | ---- |
| GET    | `/api/users/leaderboard`     | Top 10, `?scope=country\|state\|district\|neighborhood\|friends` | ✓    |
| POST   | `/api/users/friends/:id`     | Freund hinzufügen                                                | ✓    |
| DELETE | `/api/users/friends/:id`     | Freund entfernen                                                 | ✓    |
| GET    | `/api/users/supporters`      | Aktive Supporter-Profile                                         | –    |
| PUT    | `/api/users/supporter-entry` | Eigenen Supporter-Eintrag pflegen                                | ✓    |
| GET    | `/api/users/:id`             | Öffentliches Profil                                              | –    |

### Supporter-Angebote

| Method | Endpoint                         | Beschreibung             | Auth |
| ------ | -------------------------------- | ------------------------ | ---- |
| GET    | `/api/supporter-offers`          | Alle aktiven Angebote    | –    |
| POST   | `/api/supporter-offers`          | Angebot erstellen        | ✓    |
| PUT    | `/api/supporter-offers/:id/done` | Abschließen (+30 Punkte) | ✓    |
| DELETE | `/api/supporter-offers/:id`      | Löschen (nur eigene)     | ✓    |

### Health

| Method | Endpoint      | Beschreibung  |
| ------ | ------------- | ------------- |
| GET    | `/api/health` | Server-Status |

---

## Setup

### Voraussetzungen

- Node.js ≥ 18
- MongoDB läuft lokal auf Port 27017

### Installation

```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

### Umgebungsvariablen

`.env.local` (Root):

```
VITE_API_URL=http://localhost:5000/api
```

`backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/io
JWT_SECRET=dein-geheimer-schluessel
```

### Starten

```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

### Testdaten laden

```bash
cd backend && npx ts-node src/seed.ts
```

---

## Punkte- & Level-System

```
level = Math.min(100, Math.floor(points / 100))
```

| Punkte  | Stufe |
| ------- | ----- |
| 0–99    | 0     |
| 100–199 | 1     |
| …       | …     |
| 10 000+ | 100   |

Neue Prämien werden bei Stufe 1, 5, 10, 20, 25, 30, 40, 50, 75 und 100 freigeschaltet.
