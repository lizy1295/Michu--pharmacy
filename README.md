# 🏥 Michu Pharmacy (MPH)

> **Multi-tenant digital pharmacy, prescription triage, and telehealth platform tailored for Ethiopia.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📖 Comprehensive Documentation

For full architectural blueprints, entity relations, OTP recovery flow, Chapa/Telebirr payment integrations, and troubleshooting:

👉 **[Read the Full Project Documentation (PROJECT_DOCUMENTATION.md)](./PROJECT_DOCUMENTATION.md)**

---

## 📁 Repository Structure

```text
MPH/
├── frontend/   # Next.js customer-facing storefront & admin portal
├── backend/    # NestJS REST API with TypeORM & PostgreSQL
├── shared/     # Shared TypeScript contracts, enums, and DTO interfaces
├── mobile/     # React Native mobile application (scaffold pending)
└── docker-compose.yml # PostgreSQL database and backend container
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `20.x` or higher
- **PostgreSQL**: `15.x` or `16.x` (or Docker)

### 2. Build Shared Package (Mandatory First Step)
```bash
cd shared
npm install
npm run build
cd ..
```

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```
- API Base: `http://localhost:3001/api/v1`
- Swagger Docs: `http://localhost:3001/api/docs`

### 4. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
- Web Store: `http://localhost:3000`

---

## 🚀 Key Features

- 🔐 **Secure Authentication**: JWT Access + Refresh tokens, role-based protection (`customer`, `admin`, `pharmacist`, `doctor`).
- 🔑 **OTP Password Recovery**: 6-digit cryptographic OTPs with SHA-256 database hashing, anti-enumeration, 10-minute expiry, 3-attempt brute-force rate-limiting, and single-use `resetToken`.
- 💳 **Ethiopian Payment Gateways**: Native Chapa API integration with signed webhook verification and DB total verification (tamper-proof).
- 📋 **Prescription Triage**: Clinic workflow for uploading and reviewing prescription images.
- 🧾 **Automated Receipts**: Sequential receipt numbering and order ledgering.
- 📦 **Inventory & Stock Management**: Multi-branch stock counts, batch numbers, and expiration tracking.
