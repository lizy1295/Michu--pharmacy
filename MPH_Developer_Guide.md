# Michu Pharmacy (MPH) — Developer Guide

**Status:** Verified v1.1 · September 2026  
**Audience:** Engineers joining, developing, or maintaining the MPH platform

---

## 0. About This Document

This guide is an architectural and operational reference verified directly against the MPH codebase. It reflects the live implementation across the monorepo, clarifying stack versions, database conventions, security invariants, and existing technical debt.

---

## 1. What MPH is

A full-stack digital pharmacy, prescription triage, and telehealth platform tailored for the Ethiopian healthcare ecosystem. It unifies five core domains:

| Capability | Summary |
|---|---|
| **Retail e-commerce** | OTC & prescription catalog, cart, checkout, order lifecycle |
| **Prescription handling** | Patient upload → licensed pharmacist/doctor triage → approve/reject |
| **Health services** | Doctor directory, tele-consultations, medicine lookup, symptom guidance |
| **Content & Media** | Health articles and video library managed via admin dashboard |
| **Operations** | Role-gated administration across catalog, inventory, branches, receipts, and users |

Two fundamental characteristics drive most architectural and design decisions:
1. **Regulated healthcare workflow**: Human clinical sign-off is mandatory for prescription fulfillment. An order containing prescription items cannot progress until a licensed pharmacist or doctor explicitly approves it.
2. **Ethiopian market localization**: Native payment rails (Chapa, Telebirr, CBE Birr), six supported languages, and resilient offline-friendly branch workflows.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend — Next.js 15.1 (React 19, Tailwind CSS)           │
│  src/app: /(shop)  /(health)  /(account)  /admin  /track    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON, JWT Bearer
┌──────────────────────────────▼──────────────────────────────┐
│  Backend — NestJS 11 (TypeScript 5.7)                       │
│  auth · products · orders · payments · prescriptions        │
│  receipts · inventory · branches · doctors · mail           │
└───────────────┬──────────────────────────────┬──────────────┘
                │ TypeORM 0.3                  │ Local disk / static serve
┌───────────────▼──────────────┐ ┌─────────────▼──────────────┐
│  Database                    │ │  Uploads Directory         │
│  Production: PostgreSQL 16   │ │  ./uploads/prescriptions   │
│  Dev Mock:   better-sqlite3  │ └────────────────────────────┘
└──────────────────────────────┘
                │
     ┌──────────┼──────────┐
   Chapa     Telebirr     CBE
```

### 2.1 Core Technologies & Versions

- **Frontend**: Next.js `15.1.6` (Turbopack, App Router), React `19.0.0`, Tailwind CSS `3.4.17`. Located in `frontend/src/app`.
- **Backend**: NestJS `11.0.7`, Node.js `20+`, TypeORM `0.3.20`. Located in `backend/src`.
- **Shared Contracts (`@michu/shared`)**: Shared TypeScript package in `shared/` containing unified enums (`UserRole`), auth interfaces, and DTO contracts shared between frontend and backend.
- **Database Engine**:
  - **PostgreSQL 16**: Primary engine (containerized in `docker-compose.yml` as `postgres:16-alpine`, port `5435:5432`). Runs with `synchronize: false` and automated TypeORM migrations.
  - **SQLite (`better-sqlite3`)**: Lightweight zero-configuration fallback for rapid local testing when `DB_TYPE=sqlite`.
- **Payment Rails**: Chapa (primary aggregator with HMAC-SHA256 signature verification), Telebirr (Ethio Telecom mobile money), CBE Birr (Commercial Bank of Ethiopia).

### 2.2 Monorepo Layout

```text
MPH/
├── frontend/                     # Next.js 15 App Router storefront & admin portal
│   └── src/
│       ├── app/                  # Route groups: (shop), (health), (account), admin, etc.
│       ├── components/           # UI components, checkout modals, admin forms, AI assistant
│       └── lib/                  # API client, auth context, localization data
├── backend/                      # NestJS 11 REST API
│   ├── src/
│   │   ├── auth/                 # JWT token pairs, 6-digit OTP password recovery
│   │   ├── orders/               # Order entity, state machine, lifecycle management
│   │   ├── payments/             # PaymentsService + chapa, telebirr, and cbe sub-services
│   │   ├── prescriptions/        # Prescription triage & file upload handling
│   │   ├── receipts/             # Automated invoice generation (RCT-{YYYYMM}-{SEQ})
│   │   ├── inventory/            # Multi-branch stock levels, batches, expiration tracking
│   │   ├── branches/             # Branch details, contact numbers, and service hours
│   │   ├── doctors/              # Doctor profiles, specialties, and fallbacks
│   │   ├── common/               # Database config (TypeORM), guards, roles decorator
│   │   └── migrations/           # Version-controlled TypeORM SQL migrations
│   └── uploads/                  # Local storage for prescription files (served via /uploads)
├── shared/                       # @michu/shared contracts package (must be built first)
│   └── src/                      # UserRole, auth DTOs, and shared domain constants
├── mobile/                       # React Native application scaffold (stub)
└── docker-compose.yml            # Multi-service container orchestration (PostgreSQL 16 + API)
```

---

## 3. Domain Model & Invariants

### 3.1 Order

The core transactional entity:

| Field | Description | Invariant / Validation Rule |
|---|---|---|
| `orderNumber` | Unique reference string | Format: `ORD-{TIMESTAMP}-{RAND}` |
| `items` | Cart items array | Currently stored as `simple-json` (**see §7.2 technical debt**) |
| `subtotal` | Sum of item prices | Calculated server-side by checking active catalog prices |
| `tax` | Applied tax | Calculated server-side |
| `deliveryFee` | Shipping charge | Captured on checkout; see §7.5 |
| `total` | Grand total payable | Recalculated on the server: `subtotal + tax + deliveryFee`. **Never trust client total.** |
| `status` | Fulfillment status | `pending` → `approved` → `shipped` → `completed` (or `cancelled`) |
| `paymentStatus`| Gateway status | `pending` → `payment_initiated` → `paid` → `failed` / `cancelled` / `refunded` |

### 3.2 Prescription Lifecycle

Prescriptions enforce a strict clinical safety state machine:

```text
       ┌───────────┐
       │  PENDING  │
       └─────┬─────┘
             │ (Pharmacist / Doctor Review)
      ┌──────┴──────┐
      ▼             ▼
┌───────────┐ ┌───────────┐
│ APPROVED  │ │ REJECTED  │
└───────────┘ └───────────┘
```

- **Hard Regulatory Invariant:** If an order includes items marked as requiring a prescription, the order must not proceed to fulfillment (`SHIPPED` or `COMPLETED`) until the associated prescription status is transitioned to `APPROVED`.
- File uploads accept images (JPEG, PNG, GIF), PDF documents, and video formats up to 15MB. They are stored under `backend/uploads/prescriptions` with sanitized unique filenames (`{timestamp}-{safename}`).

### 3.3 User Roles & Access Control

Access control is governed by `@michu/shared/constants/roles.ts`. The platform implements 9 distinct roles with hierarchical staff access:

| Role Key | Role Name | Intended Permissions |
|---|---|---|
| `superadmin` | Super Administrator | Full system configuration, environment settings, and user administration |
| `admin` | Administrator | Operational administration across all 13 business modules |
| `staff` | Staff Member | General management access to order and inquiry queues |
| `branch_admin` | Branch Administrator | Manages specific branch inventory, orders, and branch staff |
| `pharmacist` | Licensed Pharmacist | Reviews and approves/rejects prescription uploads |
| `doctor` | Telehealth Doctor | Conducts consultations and clinical assessments |
| `cashier` | Cashier | In-store checkout, physical order processing, and payment logging |
| `worker` | Warehouse Worker | Stock intake, batch sorting, picking, and dispatch |
| `customer` | Customer | Public storefront user: browsing, purchasing, uploading prescriptions |

- **Role Normalization:** The system normalizes roles via `normalizeRole()` so `Super Admin`, `super_admin`, and `superadmin` resolve deterministically.
- **Server Guarding:** All administrative routes are protected by `JwtAuthGuard` and `RolesGuard`. The frontend link visibility is purely cosmetic; backend enforcement is mandatory.
- **Password Recovery Flow:** Implemented in `auth/` using cryptographically secure 6-digit numeric OTPs. OTPs are hashed using SHA-256 before database insertion (`password_reset_tokens`), expire in 10 minutes, enforce a 3-attempt brute-force rate limit, and issue a single-use `resetToken`.

---

## 4. Payments & Financial Integrity

The platform integrates with three Ethiopian payment rails under `backend/src/payments`:
1. **Chapa**: Primary card and mobile wallet aggregator with automated hosted checkout and webhook callbacks.
2. **Telebirr**: Direct Ethio Telecom mobile money API integration with sandbox mode support.
3. **CBE Birr**: Commercial Bank of Ethiopia direct gateway.

### 4.1 Non-Negotiable Security Invariants

These rules protect against revenue manipulation and fraud:

1. **`userId` is derived exclusively from the verified JWT.** Never read `userId` or `customerId` from the incoming request payload.
2. **`amount` is queried directly from the verified database `Order`.** The frontend submits only the `orderId` and chosen payment gateway. The server retrieves `order.total` from PostgreSQL and submits that exact figure to the gateway.
3. **Webhook authenticity must be cryptographically verified before marking an order paid.** For Chapa, the controller checks the `x-chapa-signature` header against an HMAC-SHA256 hash using the secret key (`CHAPA_WEBHOOK_SECRET`). Unsigned requests are discarded.
4. **Automated Receipt Generation:** Once a payment is confirmed via webhook or verification poll, `ReceiptsService` automatically generates an immutable receipt entry with sequential numbering (`RCT-{YYYYMM}-{SEQ}`) linked to the customer and order.

---

## 5. Notable Design Decisions

### 5.1 Doctors Fallback Resilience
`DoctorsService` falls back to an embedded `INITIAL_DOCTORS` dataset if the database query fails. This ensures the health portal `/health` remains informative during database connectivity blips. **Do not remove this fallback** without replacing it with an equivalent cache/failover strategy, and ensure failure logs alert the operations team.

### 5.2 Six-Language Localization
Localization is driven by `LanguageContext` across six languages:
- English (`en`)
- Amharic / አማርኛ (`am`)
- Tigrigna / ትግርኛ (`ti`)
- Afaan Oromoo (`om`)
- Afar (`aa`)
- Somali (`so`)

Any new user-facing copy in `frontend/src/` must be mapped across all six language dictionaries in `lib/data/` to avoid fallback inconsistency during checkout or prescription triage.

---

## 6. Feature Implementation Status

### Complete & Wired End-to-End
- Full e-commerce catalog (categories, brands, products, inventory).
- Cart with client-side persistence and server-side total recalculation.
- Order creation and multi-step fulfillment state machine.
- Chapa gateway integration with HMAC-signed webhooks and automated receipt generation (`ReceiptsModule`).
- Prescription upload (image/PDF/video, MIME-validated) and administrative triage.
- JWT authentication (access + refresh tokens) with 9 role definitions and hierarchical guards.
- Secure 6-digit OTP password recovery with SHA-256 database hashing and brute-force throttling.
- Multi-branch inventory tracking with batch numbers and expiration dates.
- Admin portal covering 13 operational dashboards.
- Email delivery via `MailModule` (Nodemailer) with graceful console fallback during local development.
- Six-language UI toggle covering shop and checkout.

### Partially Implemented

| Feature | Current State | Missing Element |
|---|---|---|
| **Consultation booking** | Doctor profiles and "Book Consultation" CTA exist in UI | No backend `bookings` entity or table; the CTA currently has no API endpoint. |
| **Symptom checker** | Frontend UI at `/symptoms` | Uses a static frontend decision tree; no backend triage service or AI backend endpoint. |
| **Medicine lookup** | Demo drug directory on `/health` | Contains a 5-drug mock dictionary; requires a licensed national formulary database. |
| **Order tracking** | Dedicated `/track` route | Relies purely on manual admin status updates; no 3rd-party logistics API integration. |
| **Notifications** | Backend `notifications` module fires events | Frontend lacks an in-app notification bell / inbox to display customer notifications. |
| **Video library** | Backend module and admin CRUD complete | Missing a public-facing video gallery page on the customer storefront. |

### Not Started
- Real-time courier/logistics dispatch integration.
- Server-side faceted catalog search (current search performs client-side filtering).
- Customer product reviews and rating stars.
- Health insurance and co-pay prescription claims integration.
- Production mobile application (scaffold only in `mobile/`).

---

## 7. Technical Debt & Immediate Fixes

### 7.1 Empty `LoyaltyModule` Skeleton
`backend/src/loyalty/loyalty.module.ts` exists as an empty NestJS module (`@Module({}) export class LoyaltyModule {}`) without entities or controllers.
- **Action:** Remove `LoyaltyModule` from `app.module.ts` and delete the folder, or implement the customer points ledger if business requirements demand it.

### 7.2 `Order.items` Stored as `simple-json`
The entire order basket is currently serialized as JSON within a single column (`items: simple-json`) on the `orders` table.
- **Problem:** You cannot perform relational queries, join against inventory, or run SQL aggregations (e.g. "top 10 products sold this quarter") without reading and deserializing every order row into Node memory.
- **Action:** Introduce an `order_items` table with foreign keys (`order_id`, `product_id`, `quantity`, `unit_price`) via a TypeORM migration before transaction volume grows.

### 7.3 Branch Data Duplicated in Frontend and Backend
Branch records exist both in the backend `branches` module (backed by the database) and as a static array in `frontend/src/lib/data/branchesData.ts`.
- **Problem:** Updating a phone number, address, or operating hours in the database will not update the static frontend page, causing customer confusion.
- **Action:** Refactor `frontend/src/app/branches` and `health` pages to fetch dynamically from `GET /api/v1/branches`.

### 7.4 Mock Medicine Catalog in Health Section
The drug lookup on `/health` is limited to 5 hardcoded items.
- **Clinical Risk:** Users searching for genuine medications might assume MPH does not stock them or that an unlisted medication does not exist.
- **Action:** Integrate with the primary `products` catalog or import a validated Ethiopian Food and Drug Authority (EFDA) drug list.

### 7.5 Unlinked `deliveryFee`
The checkout collects a `deliveryFee`, but the backend does not integrate with a logistics or dispatch partner.
- **Action:** Confirm operational fulfillment protocol (e.g., in-house motorcycle fleet vs. third-party couriers like Deliver Addis) and wire the order status to courier dispatch.

### 7.6 Mobile Folder Stub
`mobile/` is an unconfigured scaffold that is not built or deployed.
- **Action:** Either scope out the mobile app roadmap using React Native / Expo sharing `@michu/shared`, or archive the folder to keep the monorepo clean.

---

## 8. Development & Engineering Conventions

1. **Shared Contracts First:** When introducing a new enum, role, or request DTO that affects both frontend and backend, define it in `shared/src` first and execute `npm run build` inside `shared/`.
2. **Server-Side Authority:** Never trust the browser for totals, roles, discounts, or prescription approvals. Everything involving money, identity, and clinical decisions is validated in NestJS.
3. **Domain Modularity:** Adhere strictly to the `module / controller / service / entity / dto` layout in `backend/src/`. Avoid placing business logic in generic `utils/` files.
4. **Database Migrations:**
   - In PostgreSQL environments, `synchronize: false` is strictly enforced.
   - All schema modifications must be created using TypeORM migrations:
     ```bash
     npm run migration:generate -- src/migrations/YourMigrationName
     npm run migration:run
     ```
   - Do not enable `synchronize: true` in production or staging environments.
5. **Localization Completeness:** Every customer-facing string introduced in the frontend must include translations across all 6 supported Ethiopian languages.

---

## 9. Environment, Deployment & Operations

### 9.1 Environment Configuration

Configuration templates are maintained in:
- `backend/.env.example`
- `frontend/.env.example`

Key environment parameters:

| Variable | Purpose | Typical Value |
|---|---|---|
| `DB_TYPE` | Active database engine | `postgres` (production) or `sqlite` (local testing) |
| `DB_HOST`, `DB_PORT` | PostgreSQL connection | `localhost:5435` (Docker) or `5432` |
| `JWT_ACCESS_SECRET` | 32+ char secret for access tokens | Required in all environments |
| `JWT_REFRESH_SECRET` | 32+ char secret for refresh tokens | Required in all environments |
| `CHAPA_SECRET_KEY` | Chapa API secret key | `CHASECK_TEST-...` or live secret |
| `CHAPA_WEBHOOK_SECRET`| Webhook verification secret hash | Required to validate `x-chapa-signature` |
| `PAYMENT_SANDBOX_MODE`| Toggle mock/sandbox for payments | `true` during development |
| `MAIL_HOST`, `MAIL_USER`| SMTP configuration for email | Empty defaults log OTPs directly to console |

### 9.2 Local Development Startup Sequence

```bash
# 1. Build shared contracts (MANDATORY FIRST STEP)
cd shared
npm install
npm run build
cd ..

# 2. Start PostgreSQL database container
docker-compose up -d db

# 3. Start Backend API
cd backend
cp .env.example .env
npm install
npm run start:dev   # Runs on http://localhost:3001 (Swagger at /api/docs)

# 4. Start Frontend Storefront
cd ../frontend
cp .env.example .env.local
npm install
npm run dev         # Runs on http://localhost:3000
```

### 9.3 Health Data & Prescription Privacy

Prescription files uploaded by patients constitute protected medical data:
- Uploads are saved to `./uploads/prescriptions` with randomized, sanitized file paths.
- For production deployment, configure access control headers or migrate storage to a private S3-compatible bucket with time-limited pre-signed URLs.
- Ensure automated database backups and retention policies adhere to national health data regulations.

---

## 10. Prioritized Roadmap

| Priority | Task | Motivation |
|---|---|---|
| **P0 (Blocker)** | Implement Consultation Booking (`POST /api/v1/bookings`) | Doctor cards feature a "Book Consultation" CTA that currently leads nowhere. |
| **P1** | Consolidate Branch Data | Eliminate hardcoded `branchesData.ts` in favor of `GET /api/v1/branches`. |
| **P1** | Clean up `loyalty.module.ts` | Remove dead empty module shell. |
| **P2** | Normalize `Order.items` to `order_items` table | Essential for reporting, analytics, and stock reconciliation before scale. |
| **P2** | Expand Medicine Database | Replace 5-drug mock dictionary with a genuine catalog to prevent clinical misdirection. |
| **P2** | Frontend Notification Center | Surface backend notification events to the user in a UI notification tray. |
| **P3** | Public Video Gallery | Connect the completed backend videos module to a customer-facing media page. |
| **P3** | Courier / Logistics Dispatch | Automate order handover once `deliveryFee` is collected and order is approved. |
