# Michu Pharmacy

Multi-tenant online pharmacy platform (web + mobile) for browsing and purchasing medicine, supplements, cosmetics, and medical devices.

## Structure

```
├── frontend/   # Next.js customer-facing site
├── backend/    # NestJS REST API
├── mobile/     # React Native app (scaffold pending)
└── shared/     # Shared TypeScript types and constants
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API docs: http://localhost:3001/api/docs

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

## Build Order

Auth → Products/Inventory → Orders/Checkout → Prescriptions → Loyalty → Tele-health → Notifications

## Tech Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Backend:** NestJS + TypeScript + TypeORM
- **Database:** PostgreSQL
- **Auth:** JWT access + refresh tokens, bcrypt, role-based access
