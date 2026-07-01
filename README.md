# IO – Support Platform

Webbasierte Community-Plattform zur Incentivierung von Unterstützungsleistungen.
Bachelorarbeit von Abdullah Mubasher.

> Der Name IO ist inspiriert vom gleichnamigen Support-Charakter aus Dota 2, dessen Rolle darin besteht, Verbündete zu unterstützen. Zugleich steht IO sinnbildlich für Verbindung, Hilfe und gemeinschaftliches Handeln.

---

## Konzept

IO ist ein prototypisches Websystem zur digitalen Vermittlung und Anerkennung von Unterstützungsleistungen. Nutzerinnen und Nutzer können Hilfegesuche einstellen, offene Hilfegesuche annehmen oder selbst konkrete Hilfsangebote veröffentlichen. Erbrachte Hilfeleistungen werden über ein Punktesystem sichtbar gemacht. Die gesammelten Punkte beeinflussen den Fortschritt der Nutzerinnen und Nutzer in Form von Stufen, Abzeichen, Ranglistenpositionen und exemplarischen Prämien.

Das System basiert auf Gamification-Prinzipien wie Punkten, Stufen, Abzeichen, Ranglisten und freischaltbaren Angeboten. Ziel ist es nicht, Hilfeleistungen wie bezahlte Arbeit zu behandeln, sondern freiwillige Unterstützung sichtbarer zu machen und durch digitale Anerkennung zu fördern.

---

## Rollen

| Rolle     | Beschreibung                                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| Gast      | Kann öffentliche Hilfegesuche, Hilfsangebote einsehen und sich registrieren.                                      |
| Nutzer    | Angemeldete Person mit eigenem Profil, Punktestand, Stufe, Abzeichen und Zugriff auf geschützte Funktionen.       |
| Seeker    | Angemeldete Person, die ein Hilfegesuch erstellt oder ein von einem Supporter eingestelltes Hilfsangebot annimmt. |
| Supporter | Angemeldete Person, die ein offenes Hilfegesuch annimmt, Hilfe leistet oder ein eigenes Hilfsangebot erstellt.    |

Die Rollen Seeker und Supporter schließen sich nicht gegenseitig aus. Eine Person kann je nach Situation Hilfe suchen oder Hilfe leisten.

---

## Tech-Stack

### Frontend (`/src`)

- React 18 + TypeScript
- Vite 5
- CSS Modules
- React Router
- lokaler Authentifizierungsstatus über JWT
- Light- und Dark-Mode über CSS-Variablen

### Backend (`/backend/src`)

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT-Authentifizierung
- bcrypt für Passwort-Hashing
- REST-Schnittstelle mit JSON-Antworten

---

## Projektstruktur

```text
IO/
├── src/                        # React Frontend
│   ├── assets/                 # Logo-SVGs und statische Assets
│   ├── components/             # Wiederverwendbare UI-Komponenten
│   ├── contexts/               # AuthContext
│   ├── hooks/                  # Custom Hooks, z. B. useTheme
│   ├── lib/                    # API-Client
│   ├── pages/                  # Seitenkomponenten für die Routen
│   ├── styles/                 # globale Styles und CSS-Variablen
│   └── types/                  # gemeinsame TypeScript-Typen
└── backend/
    └── src/
        ├── config/             # Datenbankverbindung
        ├── middleware/         # JWT-Auth-Middleware
        ├── models/             # User, Task, SupporterOffer
        ├── routes/             # auth, tasks, users, supporterOffers
        ├── utils/              # Level- und Punktlogik
        └── seed.ts             # Testdaten-Skript
```

---

## Features

- **Registrierung und Anmeldung**
  Gäste können ein Konto erstellen und sich mit E-Mail-Adresse und Passwort anmelden. Passwörter werden im Backend mit bcrypt gehasht und nicht im Klartext gespeichert.

- **Hilfegesuche**
  Seeker können Hilfegesuche mit Titel, Beschreibung, Kategorie, Ort, Schwierigkeit und geschätzter Dauer erstellen. Der Punktwert wird automatisch berechnet.

- **Kategorie-Filter**
  Offene Hilfegesuche können nach Kategorien gefiltert werden.

- **Hilfegesuch annehmen**
  Supporter können offene Hilfegesuche annehmen. Ein bereits angenommenes Hilfegesuch kann nicht von einer weiteren Person übernommen werden.

- **Hilfegesuch abschließen**
  Angenommene Hilfegesuche können nach erbrachter Hilfe abgeschlossen werden. Die Punkte werden dem zugewiesenen Supporter gutgeschrieben und die Stufe wird neu berechnet.

- **Supporter-Einladungen**
  Beim Erstellen eines Hilfegesuchs kann ein Seeker bis zu drei Supporter gezielt einladen. Die Einladung ist informativ und sperrt das Hilfegesuch nicht für andere Supporter.

- **Timer-Flow**
  Nach dem Annehmen eines Hilfegesuchs erscheint die Aktion „Hilfe beginnen“. Erst danach startet im Frontend ein lokaler Timer. Die Aktion „Hilfe abschließen“ wird im regulären UI-Ablauf erst nach 80 % der geschätzten Dauer aktiv. Diese Logik dient im Prototyp als clientseitige Bedienlogik und ist keine vollständige serverseitige Missbrauchssicherung.

- **Hilfsangebote / Supporter-Angebote**
  Supporter können eigene konkrete Hilfsangebote einstellen. Andere angemeldete Nutzerinnen und Nutzer können diese Angebote annehmen und eine kurze Nachricht hinterlassen. Beim Abschluss wird der berechnete Punktwert gutgeschrieben.

- **Punkte und Stufen**
  Der Punktwert ergibt sich aus Schwierigkeit und geschätzter Dauer:

  ```text
  pointValue = difficulty × durationMinutes
  ```

  Die Stufe ergibt sich aus dem Punktestand:

  ```text
  level = Math.min(100, Math.floor(points / 100))
  ```

- **Rangliste**
  Die Rangliste zeigt die punktstärksten Nutzerinnen und Nutzer. Sie ist nach Deutschland, Bundesland, Bezirk, Nachbarschaft und Freundesliste filterbar. Die ersten drei Plätze werden als Podium dargestellt.

- **Freundesliste**
  Nutzerinnen und Nutzer können andere Mitglieder zur Freundesliste hinzufügen oder entfernen. Die Freundesliste dient im Prototyp vor allem zur Filterung der Rangliste.

- **Eigenes Profil**
  Das eigene Profil zeigt persönliche Angaben, Punktestand, Stufe, Abzeichen, Profilbild und getrennte Statistiken für die Rollen Seeker und Supporter.

- **Öffentliche Profile**
  Öffentliche Nutzerprofile zeigen ausgewählte Informationen wie Benutzername, Name, Profilbild, Punktestand, Stufe, Abzeichen und groben Ortsbezug. Sensible Kontodaten bleiben geschützt.

- **Supporter-Liste**
  Angemeldete Supporter können einen öffentlichen Supporter-Eintrag pflegen. Dieser zeigt, welche Art von Hilfe angeboten wird und wann die Person verfügbar ist.

- **Prämien**
  Der Prämienbereich zeigt exemplarische Prämien und Angebote. Diese werden abhängig von der erreichten Stufe freigeschaltet. Eine reale Auszahlung, Gutscheinvergabe oder Anbindung an externe Prämienpartner ist im Prototyp nicht umgesetzt.

- **Light- und Dark-Mode**
  Die Anwendung unterstützt ein helles und ein dunkles Farbschema. Die Auswahl wird lokal im Browser gespeichert.

---

## Kategorien

Hilfegesuche und Hilfsangebote können den folgenden Kategorien zugeordnet werden:

```text
Geistig
Körperlich
Talent & Kreativität
Sozial & Kommunikation
```

---

## Routen im Frontend

| Route          | Seite                                                     | Auth                    |
| -------------- | --------------------------------------------------------- | ----------------------- |
| `/`            | Landing Page für Gäste / Dashboard für angemeldete Nutzer | –                       |
| `/login`       | Anmeldung                                                 | –                       |
| `/register`    | Registrierung                                             | –                       |
| `/tasks`       | Übersicht der offenen Hilfegesuche                        | – / lesend              |
| `/tasks/new`   | Neues Hilfegesuch erstellen                               | ✓                       |
| `/tasks/:id`   | Detailansicht eines Hilfegesuchs                          | – / eingeschränkt       |
| `/supporters`  | Supporter-Seite mit Supporter-Liste und Hilfsangeboten    | – / teilweise geschützt |
| `/leaderboard` | Rangliste                                                 | ✓                       |
| `/rewards`     | Prämienbereich                                            | ✓                       |
| `/profile`     | Eigenes Profil                                            | ✓                       |
| `/users/:id`   | Öffentliches Profil                                       | –                       |

---

## API-Endpunkte

### Auth

| Method | Endpoint             | Beschreibung                                                                            | Auth |
| ------ | -------------------- | --------------------------------------------------------------------------------------- | ---- |
| POST   | `/api/auth/register` | Registrierung und Ausgabe eines JWT                                                     | –    |
| POST   | `/api/auth/login`    | Anmeldung und Ausgabe eines JWT                                                         | –    |
| GET    | `/api/auth/me`       | Eigenes Profil inklusive Statistiken                                                    | ✓    |
| PUT    | `/api/auth/profile`  | Eigenes Profil aktualisieren, z. B. Name, Avatar, Wohnort, E-Mail und optional Passwort | ✓    |

---

### Tasks / Hilfegesuche

| Method | Endpoint                  | Beschreibung                                                         | Auth |
| ------ | ------------------------- | -------------------------------------------------------------------- | ---- |
| GET    | `/api/tasks`              | Offene Hilfegesuche abrufen, optional nach Kategorie gefiltert       | –    |
| POST   | `/api/tasks`              | Neues Hilfegesuch erstellen; Punktwert wird serverseitig berechnet   | ✓    |
| GET    | `/api/tasks/:id`          | Detailansicht eines Hilfegesuchs abrufen                             | –    |
| PUT    | `/api/tasks/:id/assign`   | Offenes Hilfegesuch annehmen                                         | ✓    |
| PUT    | `/api/tasks/:id/complete` | Angenommenes Hilfegesuch abschließen; Punkte und Stufe aktualisieren | ✓    |

---

### Users / Nutzer

| Method | Endpoint                     | Beschreibung                                                                            | Auth |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------- | ---- |
| GET    | `/api/users/leaderboard`     | Rangliste abrufen; Filter über `?scope=country\|state\|district\|neighborhood\|friends` | ✓    |
| POST   | `/api/users/friends/:id`     | Nutzer zur Freundesliste hinzufügen                                                     | ✓    |
| DELETE | `/api/users/friends/:id`     | Nutzer aus der Freundesliste entfernen                                                  | ✓    |
| GET    | `/api/users/supporters`      | Öffentliche Supporter-Liste abrufen                                                     | –    |
| PUT    | `/api/users/supporter-entry` | Eigenen Supporter-Eintrag erstellen oder aktualisieren                                  | ✓    |
| GET    | `/api/users/:id`             | Öffentliches Profil eines Nutzers abrufen                                               | –    |

---

### Supporter-Angebote / Hilfsangebote

| Method | Endpoint                           | Beschreibung                                                        | Auth |
| ------ | ---------------------------------- | ------------------------------------------------------------------- | ---- |
| GET    | `/api/supporter-offers`            | Aktive Hilfsangebote abrufen                                        | –    |
| POST   | `/api/supporter-offers`            | Eigenes Hilfsangebot erstellen; Punktwert wird berechnet            | ✓    |
| PUT    | `/api/supporter-offers/:id/assign` | Hilfsangebot annehmen und Begleitnachricht speichern                | ✓    |
| PUT    | `/api/supporter-offers/:id/done`   | Hilfsangebot abschließen; berechnete Punkte und Stufe aktualisieren | ✓    |
| DELETE | `/api/supporter-offers/:id`        | Eigenes Hilfsangebot löschen                                        | ✓    |

---

### Health

| Method | Endpoint      | Beschreibung         |
| ------ | ------------- | -------------------- |
| GET    | `/api/health` | Server-Status prüfen |

---

## Setup

### Voraussetzungen

- Node.js ≥ 18
- lokale MongoDB-Instanz auf Port 27017

---

### Installation

```bash
# Frontend-Abhängigkeiten installieren
npm install

# Backend-Abhängigkeiten installieren
cd backend
npm install
```

---

### Umgebungsvariablen

Die folgenden Dateien müssen manuell angelegt werden und sind nicht im Repository enthalten.

`.env.local` im Root-Verzeichnis:

```env
VITE_API_URL=http://localhost:5000/api
```

`backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/io
JWT_SECRET=dein-geheimer-schluessel
```

---

### Anwendung starten

Backend starten:

```bash
cd backend
npm run dev
```

Frontend starten:

```bash
npm run dev
```

Standard-Adressen:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

### Testdaten laden

```bash
cd backend
npm run seed
```

Das Seed-Skript legt beispielhafte Nutzerinnen und Nutzer, Hilfegesuche und Hilfsangebote an.

Test-Login:

| Feld     | Wert                       |
| -------- | -------------------------- |
| E-Mail   | `max.mustermann@gmail.com` |
| Passwort | `maxmustermann`            |

Alle weiteren Seed-Nutzer verwenden das Passwort:

```text
password123
```

---

## Punkte- und Level-System

Der Punktwert einer Hilfeleistung wird automatisch berechnet:

```text
pointValue = difficulty × durationMinutes
```

Die Stufe wird aus dem gesamten Punktestand berechnet:

```text
level = Math.min(100, Math.floor(points / 100))
```

| Punkte  | Stufe |
| ------- | ----- |
| 0–99    | 0     |
| 100–199 | 1     |
| 200–299 | 2     |
| ...     | ...   |
| 10.000+ | 100   |

Neue Prämienbereiche werden exemplarisch bei folgenden Stufen freigeschaltet:

```text
1, 5, 10, 20, 25, 30, 40, 50, 75, 100
```

---

## Sicherheits- und Prototyp-Hinweise

- Passwörter werden mit bcrypt gehasht.
- Geschützte Endpunkte erfordern einen gültigen JSON Web Token.
- JWTs werden zustandslos verwendet; das Abmelden erfolgt clientseitig durch Entfernen des Tokens.
- Die Timer-Logik beim Abschließen eines Hilfegesuchs ist im Prototyp clientseitig umgesetzt.
- Die Prämienfunktion ist exemplarisch und enthält keine reale Auszahlung oder externe Partneranbindung.
- Die Anwendung ist als funktionaler Prototyp im Rahmen einer Bachelorarbeit konzipiert und nicht als marktreifes Produkt.

---

## Bezug zur Bachelorarbeit

Dieses Repository enthält den Prototyp zur Bachelorarbeit:

**„Entwicklung einer webbasierten Plattform zur Incentivierung von Unterstützungsleistungen“**

Der Prototyp demonstriert die zentralen Konzepte der Arbeit:

- digitale Vermittlung von Hilfegesuchen und Hilfsangeboten
- automatische Punktevergabe nach Schwierigkeit und Dauer
- Stufen, Abzeichen, Rangliste und Prämien als Gamification-Elemente
- öffentliche und geschützte Nutzerbereiche
- prototypische Umsetzung mit React, TypeScript, Node.js, Express und MongoDB
