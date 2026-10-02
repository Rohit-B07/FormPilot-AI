# FormPilot AI — Full-Stack Architecture & Landing Page

> **"Your AI Copilot for Every Form"**
> UPLOAD → UNDERSTAND → EXTRACT → SPEAK / TYPE → MAP → FILL → VALIDATE → REVIEW → READY TO SUBMIT

---

## 🌟 Overview

FormPilot AI is an AI-powered form-filling, understanding, validation, and document-readiness platform designed to eliminate the friction of bureaucratic forms, government paperwork, visa applications, and financial filings.

The project consists of:
1. **Frontend**: Cinematic editorial-style React + Tailwind landing page and interactive copilot workspace.
2. **Backend**: Production-grade Node.js/Express service integrating Google Gemini AI and Supabase (PostgreSQL + Auth + Storage).

---

## 🏗️ Architecture & Tech Stack

```
                                  ┌───────────────────────┐
                                  │      React + Vite     │
                                  │   (Frontend Client)   │
                                  └───────────┬───────────┘
                                              │ HTTP / JSON
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               Express REST API (Port 3001)                              │
│                                                                                         │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │   Auth Middleware     │  │  Rate Limiting       │  │   Validation & Schema        │  │
│  │   (Supabase JWT)      │  │  (Standard & AI)     │  │   (Zod + ValidationEngine)   │  │
│  └───────────────────────┘  └──────────────────────┘  └──────────────────────────────┘  │
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                 Core Services                                     │  │
│  │  • GeminiService (Vision OCR, Semantic Understanding, Multilingual Mapping, Chat)  │  │
│  │  • DocumentProcessor (Multimodal Form Extraction & Document Classification)       │  │
│  │  • ValidationEngine (Deterministic Rules + AI Cross-Field Consistency)            │  │
│  │  • StorageService (Supabase Buckets: forms, documents, generated)                 │  │
│  │  • FormService (End-to-end form pipeline orchestration)                           │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────┬──────────────────────────────┘
                             │                             │
                             ▼                             ▼
              ┌─────────────────────────────┐  ┌──────────────────────┐
              │     Supabase PostgreSQL     │  │      Google Gemini   │
              │  • RLS Security Policies    │  │   (gemini-2.5-flash) │
              │  • Forms, Fields, Answers   │  └──────────────────────┘
              │  • Audit Logs, Reviews      │
              └─────────────────────────────┘
```

---

## 📁 Repository Structure

```
FORMPILOT AI/
├── src/                          # Frontend React Application
│   ├── components/               # UI Sections (Hero, Journey, Copilot Demo, etc.)
│   ├── services/                 # API client & Supabase connector
│   ├── App.jsx                   # Main Landing Page Application
│   └── index.css                 # Custom styling & typography
│
├── server/                       # Backend Express Service
│   ├── src/
│   │   ├── config/               # Supabase & Gemini environment config
│   │   ├── controllers/          # Request handlers (auth, forms, AI, documents, validation)
│   │   ├── middleware/           # Auth JWT verification, rate limiting, error handling
│   │   ├── routes/               # API route definitions (/api/forms, /api/ai, etc.)
│   │   ├── schemas/              # Zod validation schemas
│   │   ├── services/
│   │   │   ├── gemini/           # GeminiService — all Google Gemini AI operations
│   │   │   ├── document/         # DocumentProcessor — multimodal OCR & classification
│   │   │   ├── form/             # FormService — workflow orchestration
│   │   │   ├── speech/           # SpeechService — speech-to-text abstraction
│   │   │   ├── storage/          # StorageService — Supabase storage management
│   │   │   └── validation/       # ValidationEngine — deterministic & readiness scoring
│   │   ├── utils/                # Standardized JSON response helpers & audit logger
│   │   └── app.js                # Express app setup and server listener
│   ├── supabase/
│   │   └── migrations/
│   │       └── 001_initial_schema.sql  # Complete schema, RLS policies, indexes
│   └── tests/
│       └── server.test.js        # Unit test suite
```

---

## 🚀 Quick Start Guide

### 1. Frontend Development

```bash
# Install frontend dependencies
npm install

# Run frontend dev server (port 5173)
npm run dev
```

The frontend will be running at [http://localhost:5173/](http://localhost:5173/).

---

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Copy environment template and fill in keys
cp .env.example .env
```

#### Required Environment Variables in `server/.env`:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

#### Apply Database Schema:
Copy the SQL from `server/supabase/migrations/001_initial_schema.sql` and run it in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).

#### Start the Backend:
```bash
# Run server with live reload
npm run dev

# Or start in production mode
npm start
```

Backend will be available at [http://localhost:3001/api](http://localhost:3001/api).

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/forms/upload` | Upload new PDF/image form for processing |
| `GET` | `/api/forms` | List all user forms with pagination |
| `GET` | `/api/forms/:id` | Get form details and current status |
| `GET` | `/api/forms/:id/fields` | Retrieve extracted fields for a form |
| `PATCH` | `/api/forms/:id/fields/:fieldId` | Edit field values directly |
| `POST` | `/api/ai/map-answer` | AI maps natural-language/voice answers to fields |
| `POST` | `/api/ai/explain-field` | AI explains confusing form fields in simple terms |
| `POST` | `/api/ai/chat` | Context-aware AI copilot chat |
| `GET` | `/api/forms/:id/validation` | Run deterministic + AI validation |
| `GET` | `/api/forms/:id/readiness` | Calculate submission readiness score (0–100%) |
| `POST` | `/api/forms/:id/approve` | Final user review and sign-off |
| `POST` | `/api/forms/:id/export` | Generate signed JSON/export package |
| `GET` | `/api/health` | Health check and uptime status |

---

## 🧪 Testing

```bash
cd server
npm test
```
