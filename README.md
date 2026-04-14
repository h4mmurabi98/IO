# IO

Webbasierte Plattform zur Incentivierung von Unterstützungsleistungen.  
Entwickelt im Rahmen der Bachelorarbeit von Abdullah.

## Tech-Stack

- **Frontend:** React 19 + TypeScript
- **Build-Tool:** Vite
- **Styling:** CSS Modules
- **Backend/DB:** Supabase (PostgreSQL + Auth)

## Projektstruktur

```
src/
  components/   # Wiederverwendbare UI-Komponenten
  pages/        # Seitenkomponenten
  styles/       # Globale CSS-Styles
  lib/          # Externe Clients (z.B. Supabase)
  hooks/        # Eigene React Hooks
  types/        # TypeScript Typen & Interfaces
```

## Setup

```bash
npm install
```

Erstelle eine `.env.local` Datei mit deinen Supabase-Zugangsdaten:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

```bash
npm run dev
```
