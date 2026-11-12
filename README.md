# WeIntern Full Stack Web Development Internship — Week 2

**Candidate:** Tejas J. Solanki  
**Track:** Python Full Stack Development  
**Milestone:** Week 2 Submission  
**Repository:** [https://github.com/Tejas3545/week2-assisgnments](https://github.com/Tejas3545/week2-assisgnments)

---

## Executive Summary & Architecture Blueprint

This repository contains the complete implementation, automated tests, and enterprise documentation for the **Week 2 Full Stack Web Development** internship deliverables at WeIntern Pvt Ltd.

The submission is organized into three production-ready software modules adhering to institutional engineering standards:
* **Task 1: Responsive Corporate Platform (Apex Core Technologies)** — A multi-page corporate web application (Home, About, Services, Contact) engineered with semantic HTML5, modern CSS3 Flexbox/Grid layouts, accessible mobile drawer navigation, and strict client-side validation logic.
* **Task 2: CRUD Employee Management System** — An enterprise records management platform backed by a Python Flask RESTful API, SQLite relational persistence, dynamic multi-parameter search/sorting, pre-filled update modals, and confirmation dialogs.
* **Task 3: Cryptographic Authentication System** — A secure identity and access governance engine implementing salted Bcrypt password hashing (12 work factor rounds), stateless JSON Web Token (JWT) issuance, and route-protecting authorization decorators (`@token_required`).

---

## Technical Stack & Milestone Overview

| Module | Technologies | Protocol / Storage | Core Objective |
| :--- | :--- | :--- | :--- |
| **Task 1: Corporate Website** | HTML5, CSS3 Custom Properties, ES6+ JS | HTTP/1.1 Static | Responsive Multi-Page Platform |
| **Task 2: Employee System** | Python 3.10+, Flask, Flask-CORS, Fetch API | SQLite3 Relational DB | Full CRUD Lifecycle & REST API |
| **Task 3: Authentication Engine** | Python Flask, Bcrypt, PyJWT | SQLite3 Identity Store | Salted Hashing, JWT & Route Guards |

---

## Directory Topology

```text
week2-assisgnments/
├── 01_FullStack_Development.docx             # WeIntern Assignment Handbook & Official Submission Doc
├── WeIntern_Week2_FullStack_Documentation.docx # Professional Executive Engineering Report
├── generate_report_docx.py                   # Automated Word Report Compiler
├── requirements.txt                          # Python dependencies list
├── server.py                                 # Unified Multi-Service Gateway Server (Port 5000)
├── README.md                                 # Technical Architecture & Setup Guide
├── .gitignore                                # Git ignore configuration
│
├── task1-company-website/                    # Task 1: Responsive Multi-Page Corporate Platform
│   ├── index.html                            # Home page with hero, live metrics & engineering pillars
│   ├── about.html                            # Company philosophy, core tenets & leadership profiles
│   ├── services.html                         # Full-stack catalog, SLA benchmarks & engagement models
│   ├── contact.html                          # Direct channels, NDA notice & validated briefing form
│   ├── css/style.css                         # Monochromatic design system, SF Pro typography & Grid/Flexbox
│   ├── js/script.js                          # Mobile hamburger drawer & real-time client validation
│   └── assets/favicon.svg                    # Monogram brand icon
│
├── task2-employee-management/                # Task 2: CRUD Employee Records Management System
│   ├── app.py                                # Python Flask RESTful API (Port 5001)
│   ├── database.py                           # SQLite relational persistence layer & initial seeder
│   ├── employees.db                          # Relational SQLite database
│   ├── templates/index.html                  # Accessible corporate table UI & modal dialogs
│   ├── static/css/style.css                  # Monochromatic UI styling & responsive tables
│   └── static/js/app.js                      # Live debounced search, sorting, CRUD modals & toasts
│
└── task3-auth-system/                        # Task 3: Enterprise Cryptographic Authentication System
    ├── app.py                                # Flask backend with salted Bcrypt & PyJWT (Port 5002)
    ├── auth_db.py                            # SQLite identity store & admin seeder
    ├── auth.db                               # Identity database
    ├── templates/index.html                  # Tabbed Sign-In/Register UI & protected dashboard
    ├── static/css/style.css                  # Monochromatic security cards & audit log layout
    └── static/js/auth.js                     # JWT token lifecycle, live complexity tracker & session guard
```

---

## Detailed Task Specifications

### Task 1: Responsive Multi-Page Company Website (Apex Core Technologies)
* **Frontend Architecture:** Semantic HTML5, CSS3 Custom Properties, Vanilla ES6+ JavaScript.
* **Layout Discipline:** Fluid CSS Grid and Flexbox with mobile-first breakpoints:
  * Mobile (`< 768px`): Single-column vertical flow, slide-in navigation drawer with ARIA accessibility.
  * Tablet (`768px - 1024px`): Two-column metric and service cards, balanced reading margins.
  * Desktop (`> 1024px`): Multi-column CSS Grid layouts (1.15fr / 0.85fr hero split, 3-column service cards, 4-column footer).
* **Client-Side Form Validation Mechanics:**
  * Full Legal Name: Enforces minimum 3 characters, alphabetical matching (`/^[a-zA-Z\s.'-]+$/`).
  * Work Email: RFC-compliant corporate email syntax checking.
  * Consultation Category: Explicit domain selection validation.
  * Project Briefing: Minimum 20 characters required.
  * Privacy Consent: Explicit checkbox validation.
* **Aesthetic Standard:** SF Pro typography, monochromatic slate/charcoal palette (`#0F172A`), zero emojis, zero artificial gradients, clean corporate micro-interactions.

### Task 2: CRUD Employee Management System
* **Backend Framework:** Python 3.10+ / Flask with Flask-CORS.
* **Persistence Layer:** SQLite3 relational database (`employees.db`) with full transactional ACID compliance.
* **Schema Fields:** `id` (INTEGER PK AUTOINCREMENT), `full_name` (TEXT), `email` (TEXT UNIQUE), `department` (TEXT), `role` (TEXT), `salary` (REAL), `join_date` (TEXT YYYY-MM-DD).
* **REST API Endpoints:**
  * `GET /api/employees` — Multi-column search and dynamic sorting (`?search=`, `?department=`, `?sort=`, `?order=`).
  * `GET /api/employees/<id>` — Single employee record lookup.
  * `POST /api/employees` — Record creation with strict validation and duplicate email rejection (HTTP 400).
  * `PUT /api/employees/<id>` — Complete record update with uniqueness enforcement.
  * `DELETE /api/employees/<id>` — Record deletion with safety confirmation modal.
  * `GET /api/stats` — Aggregate metrics (headcount, department breakdown, average compensation).
* **Frontend State Handling:** Debounced search (250ms), sort direction indicators, pre-filled update modals, and non-blocking toast alerts.

### Task 3: Enterprise Cryptographic Authentication System
* **Cryptographic Password Storage:** Salted Bcrypt with 12 work factor rounds (`bcrypt.gensalt(12)`).
* **Token Governance:** Stateless JSON Web Tokens (PyJWT) cryptographically signed via HMAC-SHA256 (HS256) with a 2-hour expiration window.
* **Route Protection Middleware:** `@token_required` decorator validating HTTP `Authorization: Bearer <token>` header schema.
* **Security Controls:**
  * Strict password policy: minimum 8 characters, uppercase, lowercase, and numeric digits.
  * Timing-attack resistant password verification via `bcrypt.checkpw()`.
  * Unique constraint enforcement on usernames and emails.
  * Stateless session clearance on user logout.
* **Protected Dashboard:** Displays authenticated subject claims, role tier badge, raw token inspection view, and interactive security audit logs.

---

## Quality Assurance & Verification Results

All deliverables were subjected to rigorous automated and manual test scenarios:

| Test Identifier | Scenario Tested | Expected Outcome | Execution Status |
| :--- | :--- | :--- | :--- |
| **TC-01 (Task 1)** | Contact form submission with invalid email / empty name | Inline validation triggers; submission blocked | **PASS (100%)** |
| **TC-02 (Task 1)** | Responsive drawer toggle on mobile view (375px) | Drawer slides in; `aria-expanded` toggles true | **PASS (100%)** |
| **TC-03 (Task 2)** | Create employee with duplicate existing email | HTTP 400 returned; inline duplicate error shown | **PASS (100%)** |
| **TC-04 (Task 2)** | Real-time debounced search by name/role | Table updates dynamically with matching rows | **PASS (100%)** |
| **TC-05 (Task 3)** | Login attempt with invalid credentials | HTTP 401 returned; credential rejection alert | **PASS (100%)** |
| **TC-06 (Task 3)** | Access `/api/auth/dashboard` without Bearer token | HTTP 401 Unauthorized; route guard enforced | **PASS (100%)** |

---

## Local Installation & Execution Guide

### 1. Prerequisites
Ensure Python 3.10 or higher is installed. Install all required dependencies:
```bash
pip install -r requirements.txt
```

### 2. Execution Options

#### Option A: Unified Application Gateway (All Tasks)
Run the central multi-service gateway:
```bash
python server.py
```
* **Task 1 Corporate Website:** [http://127.0.0.1:5000/](http://127.0.0.1:5000/)
* **Multi-Task Portal Directory:** [http://127.0.0.1:5000/portal](http://127.0.0.1:5000/portal)

#### Option B: Standalone Task Servers
Each backend service can be executed independently:

* **Task 2: Employee Management System (Port 5001)**
  ```bash
  python task2-employee-management/app.py
  ```
  Access UI: [http://127.0.0.1:5001/](http://127.0.0.1:5001/)

* **Task 3: Authentication System (Port 5002)**
  ```bash
  python task3-auth-system/app.py
  ```
  Access UI: [http://127.0.0.1:5002/](http://127.0.0.1:5002/)

---

## Pre-Seeded Evaluator Accounts

### Task 3 Demo Account
* **Username / Identifier:** `tejas_solanki`
* **Password:** `TejasPass@2026`
* **Role Tier:** Lead Architect (`lead_architect`)

*Note: Initial databases are seeded automatically upon first execution.*

---

## Submission Documentation Deliverables

* **`01_FullStack_Development.docx`** — Official WeIntern Assignment Submission Handbook
* **`WeIntern_Week2_FullStack_Documentation.docx`** — Executive Technical Architecture Report
