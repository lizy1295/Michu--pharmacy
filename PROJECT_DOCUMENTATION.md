# Michu Pharmacy (MPH) — Complete Project Documentation

Welcome to the **Michu Pharmacy** platform documentation. This guide is designed for developers, architects, and contributors who have just cloned or pulled this repository. It provides an end-to-end overview of how the system is built, how its services connect, and how to set up, develop, test, and deploy the application.

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Repository Directory Structure](#3-repository-directory-structure)
4. [Technology Stack](#4-technology-stack)
5. [Core Domain Modules](#5-core-domain-modules)
   - [Authentication & Role-Based Access Control](#51-authentication--role-based-access-control)
   - [Secure OTP-Based Password Recovery Flow](#52-secure-otp-based-password-recovery-flow)
   - [Catalog, Categories & Inventory](#53-catalog-categories--inventory)
   - [Orders & Checkout Lifecycle](#54-orders--checkout-lifecycle)
   - [Payment Integration (Chapa, Telebirr, CBE Birr)](#55-payment-integration-chapa-telebirr-cbe-birr)
   - [Prescriptions & Clinical Triage](#56-prescriptions--clinical-triage)
   - [Automated Receipts & Invoicing](#57-automated-receipts--invoicing)
   - [Admin & Analytics Dashboard](#58-admin--analytics-dashboard)
6. [Database Schema & Migrations](#6-database-schema--migrations)
7. [Getting Started (Step-by-Step Setup)](#7-getting-started-step-by-step-setup)
   - [Option A: Local Development Setup (Recommended)](#option-a-local-development-setup-recommended)
   - [Option B: Docker Compose Setup](#option-b-docker-compose-setup)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [API Documentation & Swagger](#9-api-documentation--swagger)
10. [Testing & Quality Assurance](#10-testing--quality-assurance)
11. [Troubleshooting & Common FAQs](#11-troubleshooting--common-faqs)

---

## 1. Executive Overview

**Michu Pharmacy** is a full-stack digital pharmacy and telehealth platform tailored for the Ethiopian healthcare ecosystem. It provides:
- **E-Commerce Pharmacy**: Browse and purchase prescription medications, OTC drugs, wellness supplements, cosmetics, and medical equipment.
- **Multi-Branch Inventory**: Real-time stock levels, batch numbering, and expiry alerts across local pharmacy branches.
- **Prescription Verification & Triage**: Secure prescription image uploads triaged by licensed pharmacists and doctors.
- **Ethiopian Payment Gateways**: Native integration with **Chapa**, **Telebirr**, and **CBE Birr** with idempotent webhook verification.
- **Security-First Architecture**: JWT token pairs (access + refresh), 12-round bcrypt password hashing, cryptographically hashed 6-digit OTPs with brute-force rate-limiting, and zero sensitive credential leakage.

---

## 2. High-Level Architecture

The project is structured as a monorepo containing a frontend web application, a backend API, and a shared TypeScript contracts package:

```mermaid
graph TD
    Client["Client (Browser / Next.js)"] -->|HTTP / JSON| Backend["Backend API (NestJS)"]
    Admin["Admin / Pharmacist Dashboard"] -->|HTTP / Bearer JWT| Backend
    Backend -->|TypeORM / SQL| DB[(PostgreSQL 16)]
    Backend -->|Webhooks & Verify| Chapa["Chapa Gateway"]
    Backend -->|API (Planned)| Telebirr["Telebirr / CBE"]
    Backend -->|SMTP / Nodemailer| Mailer["Email / SMS Service"]
    Shared["@michu/shared"] -.->|Imports Enums & DTOs| Client
    Shared -.->|Imports Enums & DTOs| Backend
```

### Component Roles
1. **Frontend (`frontend/`)**: Built on Next.js (App Router) + Tailwind CSS. Provides the customer storefront, multi-step account recovery wizard, prescription upload forms, order tracking, and administrative interfaces.
2. **Backend (`backend/`)**: Built on NestJS + TypeORM. Handles all business rules, database transactions, auth/security enforcement, payment webhook verification, and automated receipt generation.
3. **Shared (`shared/`)**: A pure TypeScript library containing common entities, data transfer interfaces, user roles, order statuses, and API response structures, ensuring complete type synchronization between frontend and backend.
4. **Database (`PostgreSQL`)**: Manages relational tables with foreign keys, cascading rules, unique indices, and deterministic migration versioning.

---

## 3. Repository Directory Structure

```
MPH/
├── backend/                      # NestJS REST API application
│   ├── src/
│   │   ├── admins/               # Admin management and pharmacy staff logic
│   │   ├── auth/                 # Authentication, JWT, and OTP password recovery
│   │   │   ├── dto/              # Auth request/response DTOs (Login, Register, OTP)
│   │   │   ├── entities/         # RefreshToken & PasswordResetToken entities
│   │   │   ├── guards/           # JwtAuthGuard, RolesGuard
│   │   │   └── strategies/       # Passport JWT strategy
│   │   ├── branches/             # Physical pharmacy branch management
│   │   ├── categories/           # Product taxonomy and classification
│   │   ├── common/               # Database config, custom decorators, sanitizers
│   │   ├── dashboard/            # Analytical aggregation and reporting queries
│   │   ├── doctors/              # Doctor profiles, licenses, and telehealth
│   │   ├── inventory/            # Multi-branch inventory, batch numbers, alerts
│   │   ├── mail/                 # Nodemailer wrapper & multi-channel NotificationService
│   │   ├── migrations/           # Versioned TypeORM SQL migrations
│   │   ├── orders/               # Order placement, items, status lifecycle
│   │   ├── payments/             # Chapa, Telebirr, CBE Birr integrations & webhooks
│   │   ├── prescriptions/        # Patient prescription upload & triage queue
│   │   ├── products/             # Product catalog, stock tracking, and search
│   │   ├── receipts/             # Automated receipt and invoice generation
│   │   ├── users/                # User accounts, profiles, and password hashing
│   │   ├── app.module.ts         # Root NestJS application module
│   │   └── main.ts               # Application entry point (Swagger, validation, CORS)
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/                     # Next.js customer and administrative web app
│   ├── src/
│   │   ├── app/                  # Next.js App Router (pages and layouts)
│   │   │   ├── (account)/        # /login, /register, /forgot-password, /reset-password
│   │   │   ├── (shop)/           # Storefront catalog, cart, checkout
│   │   │   ├── (health)/         # Telehealth consultations and prescriptions
│   │   │   ├── admin/            # Administrative dashboard and inventory manager
│   │   │   ├── layout.tsx        # Root layout, fonts, header, and footer
│   │   │   └── page.tsx          # Homepage with banners and featured categories
│   │   ├── components/           # Reusable UI widgets, navigation, modals, badges
│   │   ├── context/              # React Context (Auth, Cart, UI state)
│   │   ├── lib/                  # Fetch API client wrappers and token storage
│   │   └── styles/               # Global CSS and Tailwind configuration
│   ├── package.json
│   └── next.config.ts
│
├── shared/                       # Shared TypeScript contracts & interfaces
│   ├── src/
│   │   ├── index.ts              # Central export point
│   │   ├── types.ts              # User, Order, Product, Payment types
│   │   └── enums.ts              # UserRole, OrderStatus, PaymentStatus
│   └── package.json
│
├── mobile/                       # React Native application (scaffold pending)
├── docker-compose.yml            # PostgreSQL and backend Docker containers
└── README.md                     # Quick repository overview
```

---

## 4. Technology Stack

| Layer | Technology | Details / Rationale |
|---|---|---|
| **Backend Framework** | **NestJS 11** | Enterprise TypeScript framework with dependency injection, modular structure, and native Swagger support. |
| **Backend ORM** | **TypeORM 0.3** | Relational mapping with migration safety, connection pooling, and QueryBuilder. |
| **Database** | **PostgreSQL 16** | Robust relational database handling financial transactions, JSONB payloads, and concurrency. |
| **Frontend Framework** | **Next.js 14/15** | Server-side rendering (SSR) and App Router for high SEO, fast page loads, and React 19 compatibility. |
| **Styling** | **Tailwind CSS** | Custom design system using tailored emerald/brand palettes and responsive utility classes. |
| **Authentication** | **JWT + Passport** | Short-lived Access Tokens (15m) + secure Refresh Tokens (7d) stored hashed in DB. |
| **Password Hashing** | **Bcrypt** | 12 salt rounds for user credentials. |
| **OTP Security** | **SHA-256 + Crypto** | 6-digit numeric OTPs generated via `crypto.randomInt`, stored only as SHA-256 digests. |
| **Email Service** | **Nodemailer** | SMTP client with responsive HTML templates and dev-mode console fallbacks. |
| **Payment Gateways** | **Chapa / Telebirr** | Ethiopian fintech APIs with signed webhook verification and tamper-proof DB order matching. |

---

## 5. Core Domain Modules

### 5.1. Authentication & Role-Based Access Control
- **User Roles**: Supported roles defined in `@michu/shared`:
  - `CUSTOMER`: Public consumer browsing, purchasing, and uploading prescriptions.
  - `PHARMACIST`: Pharmacy staff managing prescriptions and dispensing stock.
  - `DOCTOR`: Healthcare professional reviewing telehealth cases and issuing Rx.
  - `ADMIN`: Platform administrator managing users, branches, and platform settings.
- **Dual-Token System**:
  - `accessToken`: Signed with `JWT_ACCESS_SECRET`, expires in 15 minutes, passed in HTTP `Authorization: Bearer <token>` header.
  - `refreshToken`: Signed with `JWT_REFRESH_SECRET`, expires in 7 days, persisted as a SHA-256 hash in the `refresh_tokens` table for single-client revocation (`/auth/logout`).

### 5.2. Secure OTP-Based Password Recovery Flow
Upgraded from basic links to a 4-stage OTP verification system:
1. **`POST /auth/forgot-password`**:
   - Takes `{ email, phone? }`.
   - Anti-enumeration protection: Always returns `{ message: "If that account is registered, a 6-digit verification code has been sent." }` regardless of whether the email exists.
   - Generates a 6-digit random code via `crypto.randomInt(100000, 1000000)`.
   - Stores only `sha256(otp)` in `password_reset_tokens` with a **10-minute TTL** and `attempts = 0`.
   - Invalidates previous active OTPs for that user.
   - Dispatches the code via `NotificationService` (email and/or SMS). In development, it prints clearly to the backend console: `[DEV] Password reset OTP for user@example.com: [ 123456 ]`.
2. **`POST /auth/verify-otp`**:
   - Takes `{ email, otp }`.
   - Checks expiry (10 minutes).
   - Throttles brute-force attempts: Allows a maximum of **3 failed attempts** before locking and permanently invalidating the code.
   - Upon successful verification, generates a 64-character cryptographically random `resetToken`, hashes it, and returns `{ resetToken }`.
3. **`POST /auth/reset-password`**:
   - Takes `{ resetToken, newPassword }`.
   - Validates the single-use token from the database.
   - Hashes `newPassword` using bcrypt (12 rounds) and updates the user.
   - Sets `used_at = NOW()` on the token row to prevent token replay attacks.
4. **Frontend Stepper**:
   - Located at `/forgot-password`:
     - Step 1: Email entry.
     - Step 2: 6-box numeric code input with auto-advance, backspace navigation, paste support, 10-minute countdown, and 60-second resend cooldown.
     - Step 3: Password setup with show/hide toggle and validation.
     - Step 4: Success confirmation and automatic redirect to `/login`.
     - `resetToken` is kept in React state only (never in `localStorage`) to prevent XSS exposure.

### 5.3. Catalog, Categories & Inventory
- **Products**: Items have title, brand, SKU, dosage form, prescription requirement (`requiresPrescription`), price, sale price, and stock count.
- **Multi-Branch Inventory**: Tracks physical location, batch numbers, manufacturing dates, and expiration dates.
- **Stock Triage**: Automatic flags for low stock (`stock < 10`) and out of stock (`stock == 0`).

### 5.4. Orders & Checkout Lifecycle
- **Tamper-Proof Totals**: The frontend sends only `{ orderId, paymentMethod }` or cart item IDs with quantities. The backend **always** looks up the current price in PostgreSQL, calculates subtotal, tax, and delivery fee, and computes the verified order total.
- **Order States**: `PENDING` -> `APPROVED` -> `SHIPPED` -> `COMPLETED` (or `CANCELLED`).

### 5.5. Payment Integration (Chapa, Telebirr, CBE Birr)
- **POST `/payments/initialize`**:
  - Verifies user ownership of the order.
  - Ensures the order is not already paid or cancelled.
  - Creates a `Payment` record with status `PENDING` and a unique reference: `MPH-TX-{timestamp}-{random}`.
  - Communicates with Chapa API (`POST /v1/transaction/initialize`) using `CHAPA_SECRET_KEY` on the backend only.
  - Returns the official checkout URL to redirect the customer.
- **POST `/payments/webhook/chapa`**:
  - Validates `x-chapa-signature` header against `CHAPA_WEBHOOK_SECRET` using HMAC SHA-256.
  - Verifies transaction directly with Chapa (`GET /v1/transaction/verify/{tx_ref}`).
  - Confirms amount and currency match database values.
  - Idempotent: Marks `Payment.status = 'SUCCESS'`, `Order.status = 'PAID'`, and generates an official receipt.

### 5.6. Prescriptions & Clinical Triage
- Patients upload prescription images during checkout or consultation.
- Prescriptions enter the `PENDING` clinic triage queue.
- Licensed pharmacists and doctors review details (dosage, doctor license number), and either approve, reject, or request higher resolution images.

### 5.7. Automated Receipts & Invoicing
- Once payment succeeds, the system automatically creates a `Receipt` record with a sequential human-readable receipt number (`REC-{YYYYMM}-{SEQ}`).
- Stores payer details, payment method, breakdown, and timestamps.

### 5.8. Admin & Analytics Dashboard
- Serves `/dashboard/stats`, `/dashboard/revenue`, and `/dashboard/charts`.
- Aggregates daily orders, total customers, monthly revenue, pending prescriptions triage queue, and low-inventory warnings.

---

## 6. Database Schema & Migrations

The database schema is managed via TypeORM migrations with zero automatic table drops (`synchronize: false`).

### Migration History
| Migration File | Class Name | Description |
|---|---|---|
| `1725440000000-InitialSchema.ts` | `InitialSchema1725440000000` | Core tables: `users`, `products`, `orders`, `prescriptions`, `branches` |
| `1725450000000-AddCertificationsToDoctor.ts` | `AddCertificationsToDoctor1725450000000` | Added doctor certifications and telehealth columns |
| `1757000000000-AddUserIdToPayments.ts` | `AddUserIdToPayments1757000000000` | Safe nullable foreign key `user_id` on `payments` |
| `1757100000000-CreateReceiptsTable.ts` | `CreateReceiptsTable1757100000000` | Receipts ledger with order and payment relations |
| `1757200000000-CreatePasswordResetTokens.ts` | `CreatePasswordResetTokens1757200000000` | Base password reset schema |
| `1757300000000-UpgradePasswordResetToOtp.ts` | `UpgradePasswordResetToOtp1757300000000` | Upgraded to 6-digit OTP schema (`otp_hash`, `attempts`, `reset_token_hash`, `verified_at`) |

All migrations are explicitly registered in `backend/src/common/database/typeorm.config.ts`.

---

## 7. Getting Started (Step-by-Step Setup)

### Option A: Local Development Setup (Recommended)

#### Prerequisites
- **Node.js**: v20.x or higher (`node -v`)
- **npm**: v10.x or higher (`npm -v`)
- **PostgreSQL**: v15 or v16 running locally (or SQLite fallback)

#### Step 1: Clone the Repository
```bash
git clone https://github.com/lizy1295/Michu--pharmacy.git
cd Michu--pharmacy
```

#### Step 2: Build the Shared Package
The shared package contains TypeScript types required by both the frontend and backend. Build it first:
```bash
cd shared
npm install
npm run build
cd ..
```

#### Step 3: Configure and Run Backend
1. Enter the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and configure your database credentials:
   ```env
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=MPH
   ```
   *(Ensure the `MPH` database exists in PostgreSQL: `CREATE DATABASE "MPH";`)*

3. Run migrations and start the server:
   ```bash
   npm run start:dev
   ```
   The backend API will start on `http://localhost:3001`.
   Swagger API docs: `http://localhost:3001/api/docs`.

#### Step 4: Configure and Run Frontend
1. Open a new terminal, enter the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The web store will open on `http://localhost:3000`.

---

### Option B: Docker Compose Setup

If you prefer running PostgreSQL and the backend in Docker:
```bash
docker-compose up -d
```
This boots:
- PostgreSQL on port `5432` with user `postgres` and database `MPH`.
- Backend API on port `3001`.

Then build the shared package and run the frontend locally:
```bash
cd shared && npm run build
cd ../frontend && npm install && npm run dev
```

---

## 8. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `3001` | Port the NestJS server listens on. |
| `NODE_ENV` | `development` | Environment mode (`development` / `production`). |
| `DB_TYPE` | `postgres` | Database driver (`postgres` or `sqlite`). |
| `DB_HOST` | `localhost` | PostgreSQL host. |
| `DB_PORT` | `5432` | PostgreSQL port. |
| `DB_USERNAME` | `postgres` | PostgreSQL username. |
| `DB_PASSWORD` | - | PostgreSQL user password. |
| `DB_NAME` | `MPH` | Database name. |
| `JWT_ACCESS_SECRET` | *(secret)* | Secret key for signing access tokens. |
| `JWT_REFRESH_SECRET` | *(secret)* | Secret key for signing refresh tokens. |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Lifetime of access token. |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Lifetime of refresh token. |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin for CORS. |
| `CHAPA_SECRET_KEY` | - | Secret key from Chapa dashboard (keep only in backend). |
| `CHAPA_BASE_URL` | `https://api.chapa.co` | Official Chapa API base URL. |
| `CHAPA_WEBHOOK_SECRET` | - | Hash secret to verify Chapa webhook signatures. |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP server hostname. |
| `MAIL_PORT` | `587` | SMTP server port (`587` for TLS, `465` for SSL). |
| `MAIL_USER` | - | SMTP account username. |
| `MAIL_PASS` | - | SMTP account application password. |
| `MAIL_FROM` | `"Michu Pharmacy" <...>` | Sender header in outgoing emails. |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend web URL. |

> [!NOTE]
> In local development, if `MAIL_HOST` or `MAIL_USER` is empty, Nodemailer will not crash. Instead, OTP codes are logged directly to your terminal console: `[DEV] Password reset OTP for user@example.com: [ 123456 ]`.

---

### Frontend (`frontend/.env.local`)

| Variable | Default Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | Public backend endpoint for client-side API requests. |
| `NEXT_PUBLIC_APP_NAME` | `Michu Pharmacy` | Brand name displayed throughout UI. |

---

## 9. API Documentation & Swagger

When the backend is running, full interactive OpenAPI / Swagger documentation is available at:
👉 **`http://localhost:3001/api/docs`**

### Summary of Key Endpoints

#### Authentication & Account Recovery
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new customer account | Public |
| `POST` | `/api/v1/auth/login` | Login with email/phone and password | Public |
| `POST` | `/api/v1/auth/refresh` | Refresh expired access token | Public |
| `POST` | `/api/v1/auth/logout` | Revoke active refresh token | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Bearer Token |
| `POST` | `/api/v1/auth/forgot-password` | Request 6-digit OTP code (anti-enumeration safe) | Public |
| `POST` | `/api/v1/auth/verify-otp` | Verify 6-digit OTP code & receive `resetToken` | Public |
| `POST` | `/api/v1/auth/reset-password` | Set new password using single-use `resetToken` | Public |

#### Payments & Orders
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/orders` | Create an order with items and address | Bearer Token |
| `GET` | `/api/v1/orders/my-orders` | List logged-in user's orders | Bearer Token |
| `POST` | `/api/v1/payments/initialize` | Initialize Chapa payment with verified total | Bearer Token |
| `POST` | `/api/v1/payments/webhook/chapa`| Chapa payment event webhook handler | Signature |
| `GET` | `/api/v1/receipts/:id` | Retrieve digital receipt | Bearer Token |

---

## 10. Testing & Quality Assurance

### Running Backend Unit Tests
The test suite includes full coverage for authentication, registration, login, rate limiting, and OTP password recovery.

Run all tests in-band:
```bash
cd backend
npx jest src/auth/auth.service.spec.ts --runInBand
```

### Running TypeScript Typechecks
Ensure there are no compilation or typing issues across the codebase:

```bash
# Check shared
cd shared && npx tsc --noEmit

# Check backend
cd backend && npx tsc --noEmit

# Check frontend
cd frontend && npx tsc --noEmit
```

---

## 11. Troubleshooting & Common FAQs

### 1. `Cannot find module '@michu/shared'`
- **Cause**: The shared package has not been compiled yet.
- **Fix**: Run `cd shared && npm install && npm run build`.

### 2. Password Reset OTP email is not arriving in my inbox
- **Cause**: SMTP credentials are not configured in `backend/.env`.
- **Fix**: In development mode, check your backend terminal window. The system logs the 6-digit code:
  ```text
  [DEV] Password reset OTP for customer@example.com: [ 582914 ]
  ```
  Enter that code directly into the UI at `http://localhost:3000/forgot-password`.

### 3. Database connection refused (`ECONNREFUSED 127.0.0.1:5432`)
- **Cause**: PostgreSQL service is stopped or port is incorrect.
- **Fix**:
  - Verify PostgreSQL is running: `pg_isready -h localhost -p 5432`.
  - Alternatively, use Docker: `docker-compose up -d db`.

### 4. `Too many failed attempts. This code has been invalidated.`
- **Cause**: The OTP rate-limiting guard triggered after 3 incorrect guesses.
- **Fix**: Click **"Resend Code"** in the recovery UI to receive a fresh OTP.

---

## Contributing & Development Guidelines

1. **Keep Entities and Shared Interfaces in Sync**: Any new field added to a database entity must be reflected in `@michu/shared`.
2. **Never Commit Secrets**: Do not commit live Chapa keys, database passwords, or JWT secrets to Git.
3. **Always Use TypeORM Migrations**: Do not change the production database directly; generate migrations using `npm run migration:create`.
4. **Preserve Anti-Enumeration**: Public account recovery endpoints must never disclose whether an account exists.
