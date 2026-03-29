# Solawi Manager

Verwaltungssystem fuer Solidarische Landwirtschaft (Solawi).

## Features

- **Benutzerverwaltung** - Mitglieder und Administratoren
- **Abonnement-System** - Verwaltung mit eindeutiger ID (S0001-S9999)
- **Verteilpunkte** - Lokale Abholstationen
- **Abstimmungssystem** - Jaehrliche Beitragsbestimmung
- **Finanzverwaltung** - CSV-Import von Banktransaktionen
- **Blog & Rezepte** - Content fuer Mitglieder
- **Bewerbungsformular** - Oeffentliches Bewerbungsportal

## Tech Stack

- **Backend:** NestJS (TypeScript)
- **Frontend:** Next.js 14 (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** Tailwind CSS + shadcn/ui
- **Infrastruktur:** Docker Compose

## Schnellstart

### Voraussetzungen

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Installation

```bash
# Repository klonen
cd solawi-manager

# Abhaengigkeiten installieren
pnpm install

# Umgebungsvariablen kopieren
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

### Entwicklungsumgebung starten

```bash
# Alle Services mit Docker starten
docker-compose up -d

# Datenbank-Migrationen ausfuehren
pnpm db:migrate

# (Optional) Testdaten einspielen
pnpm db:seed

# Entwicklungsserver starten
pnpm dev
```

Die Anwendung ist dann verfuegbar unter:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api/v1
- **MailHog (E-Mail-Test):** http://localhost:8025

### Testumgebung

```bash
# Testumgebung mit Seed-Daten starten
docker-compose -f docker-compose.test.yml up -d
```

Testumgebung verfuegbar unter:
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:4001/api/v1
- **MailHog:** http://localhost:8026

### Test-Accounts (nach Seeding)

- **Admin:** admin@solawi-test.de
- **Mitglieder:** mitglied1@solawi-test.de ... mitglied20@solawi-test.de

## Projektstruktur

```
solawi-manager/
├── packages/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── modules/  # Feature-Module
│   │   │   └── common/   # Guards, Decorators
│   │   └── prisma/       # Schema & Migrationen
│   └── frontend/         # Next.js App
│       └── src/
│           ├── app/      # App Router Pages
│           ├── components/
│           └── lib/
├── docker/               # Dockerfiles
├── docker-compose.yml    # Entwicklung
└── docker-compose.test.yml # Test mit Seed-Daten
```

## API-Endpunkte

### Authentifizierung
- `POST /auth/magic-link/request` - Login-Code anfordern
- `POST /auth/magic-link/verify` - Code verifizieren
- `GET /auth/me` - Aktueller Benutzer
- `POST /auth/logout` - Abmelden

### Abonnements
- `GET /subscriptions` - Liste (Admin: alle, User: eigenes)
- `GET /subscriptions/:id/balance` - Kontostand

### Abstimmung
- `GET /voting/current` - Aktuelle Abstimmungsrunde
- `POST /voting/vote` - Abstimmen
- `GET /voting/rounds/:id/stats` - Statistiken (Admin)

### Finanzen (Admin)
- `POST /finance/import` - CSV importieren
- `GET /finance/statistics` - Einnahmenstatistik
- `GET /finance/negative-balances` - Negative Kontostände

## Lizenz

Proprietär - Alle Rechte vorbehalten.
