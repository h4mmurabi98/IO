# IO

Webbasierte Plattform zur Incentivierung von Unterstützungsleistungen.  
Bachelorarbeit von Abdullah.

## Tech-Stack

**Frontend**
- React 18 + TypeScript
- Vite 5
- CSS Modules

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentifizierung

## Projektstruktur

```
IO/
├── src/                  # React Frontend
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── lib/
│   ├── hooks/
│   └── types/
└── backend/              # Express API
    └── src/
        ├── config/       # Datenbankverbindung
        ├── models/       # Mongoose Schemas
        ├── routes/       # API Endpoints
        └── middleware/   # Auth etc.
```

## Setup

### Voraussetzungen
- Node.js
- MongoDB (lokal auf Port 27017)

### Installation

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### Umgebungsvariablen

`.env.local` im Root:
```
VITE_API_URL=http://localhost:5000/api
```

`backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/io
JWT_SECRET=...
```

### Starten

```bash
# Backend
cd backend && npm run dev

# Frontend (neues Terminal)
npm run dev
```

## API

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| POST | /api/auth/register | Registrierung |
| POST | /api/auth/login | Login |
| GET | /api/health | Server-Status |
