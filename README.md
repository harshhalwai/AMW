# AMW (Amit Mobile World) - Mobile Repair & Accessories OS

[![React](https://img.shields.io/badge/Frontend-React_19_+_TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_7.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Django](https://img.shields.io/badge/Backend-Django_6.0_+_DRF-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL_8.0_/_SQLite-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

> A modern, fintech-grade Repair ERP, Inventory Management, and E-commerce system engineered specifically for mobile electronics repair shops, spare parts distributors, and accessories retailers.

---

## 1. Project Introduction

**AMW (Amit Mobile World)** is an enterprise-ready, all-in-one operating platform for modern mobile retail and service centers. It bridges customer transparency with shop-floor efficiency by offering a public-facing customer portal (instant live repair tracking without login, online repair booking, and product catalog) alongside high-performance management consoles for shop owners, administrators, and repair technicians.

---

## 2. Project Overview

The AMW platform resolves the core operational bottlenecks of mobile repair businesses:
- **Customer Frustration**: Customers can track their repair status in real-time by typing their Job Sheet Number or Mobile Number directly on the homepage, without having to register or make phone calls.
- **Technician Workflow**: Technicians have dedicated workbench views with device pattern unlock visualizers, diagnostic checklists, and parts status tracking.
- **Secure Delivery & Fraud Prevention**: Device handovers are protected by cryptographic One-Time Passwords (OTP) verified before release.
- **Inventory & Sales**: Full product lifecycle management across Mobile Phones, Audio Gadgets, Fast Chargers, and OEM Replacement Screens with live low-stock alerts.
- **Fintech Aesthetic**: Built on a modern `#080A0F` dark design language featuring glassmorphism, accent flame gradients (`#FF5733`), and interactive Recharts data visualization.

---

## 3. Features

### 🛍️ Public Customer Portal
- **High-Converting Landing Page**: Hero section with real-time shop performance metrics, service highlights, and brand trust badges.
- **Instant Repair Tracker**: Live status lookup modal by Job Sheet Number (e.g. `AMW-JOB-001`) or Customer Mobile Number.
- **Online Repair Booking**: Interactive modal allowing customers to select device brand, model, fault category, and schedule drop-offs.
- **E-Commerce & Accessories Catalog**: Category filtering (All, Smartphones, Accessories, Spare Parts, Gadgets), search, and Quick View specifications modal.
- **Interactive Cart & Reservation**: Slide-out cart drawer supporting instant store pickup reservations.
- **Customer Reviews & Testimonials**: Verified ratings and testimonials tied to completed job sheets.

### 📊 Master Admin / Owner Dashboard
- **Three-Column Layout**:
  - **Left Sidebar**: 10-module navigation with status indicators, responsive mobile drawer, and quick logout.
  - **Main Console**: Real-time KPI statistics cards (Revenue, Active Jobs, Delivered, Inventory Count), interactive Revenue Trends area chart, Brand Share analysis, and Recent Repair Orders queue.
  - **Right Intelligence Panel**: Live audit activity feed, critical store alerts, low-stock warnings, and quick action launchpads.
- **Product & Inventory Management (`/app/products`)**:
  - SKU-level tracking with stock adjustments, category tags, price updates, and low-stock filters.
  - Dual view modes: Visual Card Grid and High-Density Data Table.
- **Repair Order Center (`/app/jobs`)**:
  - Comprehensive job sheets with device lock patterns (3x3 grid visualizer), intake accessories checklist, diagnostic notes, and cost estimation.
  - Tax invoice generator with GSTIN compliance and print preview.
  - Secure OTP verification workflow for device handovers.
- **Customer Relationship Management (`/app/customers`)**:
  - Customer directory with historical repair ledger, contact details, and direct messaging thread.
- **Staff & Payroll Management (`/app/employees`)**:
  - Technician roster, job completion leaderboards, monthly salary calculations in INR (₹), and active/suspend status toggles.
- **Analytics & Reporting (`/app/analytics`)**:
  - Financial turnover graphs, technician fix-rate analytics, customer retention metrics, and exportable summary reports.

### 🛠️ Employee / Technician Portal
- **Focused Workbench**: Streamlined queue showing repairs specifically assigned to the logged-in technician.
- **Device Pattern & Lock Viewer**: Visual render of Android unlock patterns or numerical PINs submitted during intake.
- **One-Click Progression**: Update bench status (`Pending` ➔ `In Progress` ➔ `Completed`) with automated customer notification triggers.

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19.x with TypeScript 5.8 |
| **Bundler & Tooling** | Vite 7.3 with Rollup Code Splitting (`vendor-react`, `vendor-charts`, `vendor-query`) |
| **Styling & Design** | Tailwind CSS v4.0 (CSS Variables `@theme inline`, Glassmorphism, Radix UI Primitives) |
| **Data Visualization** | Recharts v2.15 (ResponsiveContainer, AreaChart, BarChart, PieChart, Tooltips) |
| **Icons & Feedback** | Lucide React, Sonner Toast Notifications |
| **Backend Framework** | Python 3.11 - 3.13, Django 6.0 |
| **API Architecture** | Django REST Framework (DRF) with SimpleJWT Authentication |
| **Database Engines** | MySQL 8.0 (Production) / SQLite3 (Development) via PyMySQL |
| **Security & Headers** | Django-Cors-Headers, Token Rotation, CSRF, Secure Cookies |

---

## 5. Project Folder Structure

```
amw/
├── .env.example              # Sample environment variables for Backend & Frontend
├── .gitignore                # Comprehensive Git exclusion rules
├── DEPLOYMENT.md             # Production hosting, Nginx, Gunicorn & SSL guide
├── README.md                 # Master project documentation
│
├── backend/                  # Django REST Framework Application
│   ├── manage.py             # Django CLI entrypoint
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Backend environment secrets (excluded from git)
│   ├── .env.example          # Sample backend configuration
│   │
│   ├── config/               # Project root settings & URL routing
│   │   ├── settings.py       # Configurable SQLite/MySQL, CORS, and JWT
│   │   ├── urls.py           # Master API routing table
│   │   └── wsgi.py           # Production WSGI application
│   │
│   ├── authentication/       # Custom User model, Login/Register & JWT endpoints
│   ├── customers/            # Customer directory & messaging API
│   ├── dashboard/            # Aggregated analytics (/api/dashboard/stats/)
│   ├── employees/            # Technician records & payroll API
│   ├── invoices/             # Invoice generation & billing
│   ├── jobs/                 # Repair job sheets, OTP delivery & ratings
│   ├── notifications/        # System event dispatch & notification queue
│   ├── repairs/              # Repair stages & device specifications
│   └── reports/              # Aggregated business reports
│
└── frontend/                 # React 19 + TypeScript + Tailwind CSS Frontend
    ├── package.json          # Node dependencies and scripts
    ├── vite.config.ts        # Vite configuration with chunk splitting
    ├── tsconfig.json         # Strict TypeScript compiler options
    ├── src/
    │   ├── api/              # Axios/Fetch API client and token storage
    │   ├── components/       # Reusable components (StatCard, Section, UI primitives)
    │   ├── contexts/         # Authentication and Theme providers
    │   ├── layouts/          # Responsive AppLayout (10-module Left Sidebar, Navbar)
    │   ├── pages/            # View pages
    │   │   ├── Landing.tsx   # Premium public homepage with tracker & booking
    │   │   ├── dashboard/    # 3-column Fintech Master Dashboard
    │   │   ├── products/     # Product catalog & stock inventory management
    │   │   ├── jobs/         # Repair orders, Job Details, New Job Intake
    │   │   ├── customers/    # Customer directory & history
    │   │   ├── employees/    # Staff & payroll management
    │   │   ├── analytics/    # Financial & operational charts
    │   │   ├── feedback/     # Customer testimonials
    │   │   ├── messages/     # Internal messaging
    │   │   ├── login/        # Role-based login portals
    │   │   └── settings/     # Shop profile & GSTIN settings
    │   ├── services/         # Client-side stores, models & default mock datasets
    │   └── styles/           # Tailwind v4 theme variables (#080A0F palette)
```

---

## 6. Frontend Installation

Navigate to the `frontend/` directory and install dependencies:

```bash
cd frontend
npm install
```

---

## 7. Backend Installation

Navigate to the `backend/` directory:

```bash
cd backend
```

Ensure Python 3.11 or higher is installed:
```bash
python --version
```

---

## 8. Python Virtual Environment Setup

### On Windows (PowerShell):
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### On Linux / macOS (Bash):
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 9. Environment Variables

Create `.env` in `backend/` based on `.env.example`:

```ini
DEBUG=True
SECRET_KEY=your-django-secret-key-for-development
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Database Selection: 'sqlite' or 'mysql'
DB_TYPE=sqlite

# If DB_TYPE=mysql, configure:
DB_NAME=amw_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=3306
```

Create `.env` in `frontend/` based on `frontend/.env.example`:

```ini
VITE_API_BASE_URL=http://localhost:8000
```

---

## 10. MySQL Database Configuration

To use MySQL in development or production:

1. Start your MySQL Server (e.g. MySQL 8.0 or XAMPP / MariaDB).
2. Create the database:
   ```sql
   CREATE DATABASE amw_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Set `DB_TYPE=mysql` in `backend/.env`.
4. Fill in `DB_USER` and `DB_PASSWORD`.
5. Run migrations (see next section).

*Note: If MySQL is not running, set `DB_TYPE=sqlite` to run with zero external setup.*

---

## 11. Django Migrations

Apply database schemas and initialize default tables:

```bash
cd backend
# Windows: .\.venv\Scripts\python.exe manage.py migrate
# Linux/Mac: source .venv/bin/activate && python manage.py migrate
python manage.py migrate
```

Verify system health:
```bash
python manage.py check
```

Create a Django administrator superuser (optional):
```bash
python manage.py createsuperuser
```

---

## 12. Frontend Development Commands

Start the Vite development hot-reloading server:

```bash
cd frontend
npm run dev
```

The frontend will be accessible at: `http://localhost:5173`.

---

## 13. Production Build Commands

### Frontend Production Build:
```bash
cd frontend
npm run build
```
The optimized bundles are placed in `frontend/dist/`.

### Preview Production Build Locally:
```bash
npm run preview
```

### Type Checking:
```bash
npx tsc --noEmit
```

### Backend Static Files:
```bash
cd backend
python manage.py collectstatic --noinput
```

---

## 14. Deployment Instructions

Refer to the complete [DEPLOYMENT.md](file:///c:/Users/tilak/Documents/Website%20project/AWM%20site/amw76/amw/DEPLOYMENT.md) guide for full production instructions including:
1. Setting up an Ubuntu Server with Nginx, Gunicorn, and MySQL.
2. Configuring SSL certificates via Let's Encrypt / Certbot.
3. Setting up systemd background services with automatic restarts.
4. Implementing database automated backups.

---

## 15. API Configuration

The backend exposes a full suite of REST endpoints protected by JWT Bearer tokens:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login/` | User authentication & JWT issuance |
| `GET` | `/api/dashboard/stats/` | Aggregated analytics & store KPIs |
| `GET`, `POST` | `/api/jobs/` | List and create repair job sheets |
| `GET`, `PUT`, `DELETE` | `/api/jobs/<id>/` | View, update, or remove repair jobs |
| `POST` | `/api/jobs/<id>/deliver/` | Verify OTP code & complete handover |
| `POST` | `/api/jobs/<id>/rate/` | Submit customer star rating and review |
| `GET`, `POST` | `/api/customers/` | List and register customer profiles |
| `GET`, `POST` | `/api/employees/` | Staff directory & payroll management |
| `GET`, `POST` | `/api/notifications/` | In-app alerts and notifications |

---

## 16. Troubleshooting

### Issue: "Pillow is not installed"
- **Cause**: Image handling requires Pillow compiled for your active Python version.
- **Fix**: Run `pip install Pillow` inside your active `.venv`. Ensure Python version matches the virtual environment (`python --version`).

### Issue: "CORS error in browser console"
- **Cause**: Frontend origin not in backend allowed origins.
- **Fix**: Verify `CORS_ALLOWED_ORIGINS` in `backend/.env` contains your frontend address (e.g., `http://localhost:5173`).

### Issue: "404 Not Found on browser reload on production"
- **Cause**: Nginx not configured with SPA fallback.
- **Fix**: In your Nginx config, ensure `location / { try_files $uri $uri/ /index.html; }` is specified.

---

## 17. Future Improvements

1. **Automated WhatsApp Business API**: Instant notification dispatch via WhatsApp when a job changes from `In Progress` to `Ready for Delivery`.
2. **Barcode & QR Code Scanner**: Direct camera scanning of job sheet QR codes from technician mobile devices.
3. **Supplier Order Integration**: Automated purchase orders when spare parts drop below minimum safety stock.
4. **Multi-Branch Support**: Centralized administration for owners managing multiple shop locations.

---

© 2026 Amit Mobile World (AMW). All rights reserved.

