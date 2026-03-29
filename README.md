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

- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Sprache:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** Cookie-basierte Sessions, Passkeys (WebAuthn)
- **Infrastruktur:** Docker Compose

## Schnellstart

### Voraussetzungen

- Node.js 22+
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
```

### Entwicklungsumgebung starten

```bash
# Datenbank und Mail-Service starten
docker-compose up -d postgres mailhog

# Datenbank-Migrationen ausfuehren
pnpm db:migrate

# (Optional) Testdaten einspielen
pnpm db:seed

# Entwicklungsserver starten
pnpm dev
```

Die Anwendung ist dann verfuegbar unter:
- **App:** http://localhost:3000
- **MailHog (E-Mail-Test):** http://localhost:8025

### Mit Docker (komplett)

```bash
# Alle Services mit Docker starten
docker-compose up -d
```

### Testumgebung

```bash
# Testumgebung mit Seed-Daten starten
docker-compose -f docker-compose.test.yml up -d
```

Testumgebung verfuegbar unter:
- **App:** http://localhost:3001
- **MailHog:** http://localhost:8026

### Test-Accounts (nach Seeding)

- **Admin:** admin@solawi-test.de
- **Mitglieder:** mitglied1@solawi-test.de ... mitglied20@solawi-test.de

## Projektstruktur

```
solawi-manager/
├── app/                      # Next.js Application
│   ├── src/
│   │   ├── app/              # App Router (Pages & API Routes)
│   │   │   ├── (admin)/      # Admin-Bereich
│   │   │   ├── (public)/     # Oeffentliche Seiten
│   │   │   ├── (user)/       # Mitglieder-Bereich
│   │   │   └── api/          # API Routes
│   │   ├── components/       # React Components
│   │   │   ├── forms/        # Formulare
│   │   │   └── ui/           # UI Components (shadcn)
│   │   └── lib/
│   │       ├── actions/      # Server Actions
│   │       ├── auth/         # Auth-Logik
│   │       └── services/     # Business Logic
│   └── prisma/               # Schema & Migrationen
├── Dockerfile                # Production Build
├── Dockerfile.dev            # Development
├── docker-compose.yml        # Entwicklung
└── docker-compose.test.yml   # Test mit Seed-Daten
```

## API Routes

### Authentifizierung
- `POST /api/auth/request-code` - Login-Code anfordern
- `POST /api/auth/login` - Code verifizieren
- `GET /api/auth/me` - Aktueller Benutzer
- `POST /api/auth/logout` - Abmelden
- `POST /api/auth/passkey/*` - Passkey-Authentifizierung

### Abonnements
- `GET /api/subscriptions` - Liste (Admin: alle, User: eigenes)
- `GET /api/subscriptions/:id/balance` - Kontostand

### Abstimmung
- `GET /api/voting/current` - Aktuelle Abstimmungsrunde
- `POST /api/voting/vote` - Abstimmen
- `GET /api/voting/rounds/:id/stats` - Statistiken (Admin)

### Finanzen (Admin)
- `GET /api/finance/statistics` - Einnahmenstatistik
- `GET /api/finance/negative-balances` - Negative Kontostände
- `GET /api/finance/transactions` - Alle Transaktionen
- `GET /api/finance/unmatched` - Nicht zugeordnete Transaktionen

## Scripts

```bash
pnpm dev              # Entwicklungsserver
pnpm build            # Production Build
pnpm start            # Production Server
pnpm lint             # Linting
pnpm db:migrate       # Migrationen ausfuehren
pnpm db:seed          # Testdaten einspielen
pnpm db:studio        # Prisma Studio oeffnen
```

## Lizenz

Proprietaer - Alle Rechte vorbehalten.
