# FixMyCampus — Facilities Management & Dispatch Portal

## 👥 Team Members & Responsibilities

- **Eyob Getachew** — Team Lead & Pitch
- **Zeresenay Hailu** — Frontend Developer
- **Semirawit Atinafu** — Backend Developer
- **Tizita H/mariyam** — Database & Full-Stack Developer
- **Eyob Getachew** — QA & Testing

---

**FixMyCampus** is an enterprise-grade campus facilities operations, ticket dispatch, and issue-tracking web application designed for universities and higher-education institutions. Built with modern Angular standalone architecture, Tailwind CSS v4, Signals, and Reactive Forms, following the **Google Stitch Design System** (Project ID `10488136688975415921` & `design.md`).

---

## 🚀 Key Features

- **Modern Authentication Flow**:
  - Borderless, floating login interface with soft ambient lighting and brand styling.
  - Reactive forms with email format and password length validation.
  - Interactive password visibility toggle and "Keep me signed in" persistence.
  - Role-based automatic redirection on sign-in.
- **Role-Based Access Control & Routing**:
  - **Administrator** (`/admin/dashboard`): Facilities overview, ticket triage, technician dispatch, reporters registry, building zones, reports, and system settings.
  - **Reporter / Student & Staff** (`/reporter/dashboard`): Ticket submission, issue progress tracking, and resolution history.
  - **Technician** (`/technician/dashboard`): Assigned work orders queue, repair diagnostics, and job completion workflow.
- **Enterprise Error Handling & Security**:
  - Graceful handling of unknown/unsupported backend roles (displays inline error, logs for debugging, avoids unauthorized redirect loops).
  - Secure credential handling (passwords are **never** stored in browser storage or printed to logs).
  - Centralized HTTP interceptors for automatic Bearer token injection and 401 session expiration handling.
  - Route guards (`adminGuard`, `roleGuard`) to protect internal endpoints.
- **Visual Design System**:
  - Consistent institutional palette anchored in Deep Navy (`#00236f` / `#1e3a8a`), cool Slate neutrals, and semantic status indicators.
  - Typography powered by Google Font **Inter** and Google **Material Symbols Outlined**.
  - Fully responsive across desktop, laptop, tablet, and mobile viewports.

---

## 📂 Project Architecture

```
FixMyCampus_client/
├── src/
│   ├── app/
│   │   ├── components/            # Reusable UI components (stat-cards, modals, badges, form-fields)
│   │   ├── features/              # Modular feature domains
│   │   │   ├── auth/              # LoginComponent & authentication views
│   │   │   ├── dashboard/         # Admin analytical dashboard
│   │   │   ├── tickets/           # Ticket list and detail management
│   │   │   ├── technicians/       # Technicians directory & technician portal
│   │   │   ├── reporters/         # Reporters directory & reporter portal
│   │   │   ├── buildings/         # Campus buildings and facilities list
│   │   │   ├── reports/           # Metric reports and analytical exports
│   │   │   └── settings/          # System configuration & notification toggles
│   │   ├── guards/                # Route authorization guards (adminGuard, roleGuard)
│   │   ├── interceptors/          # HTTP request/response interceptors (auth, error)
│   │   ├── layout/                # Persistent layouts (admin-layout, header, sidebar)
│   │   ├── models/                # Typed models (User, Ticket, Building, Technician, Reporter)
│   │   ├── services/              # Angular services (AuthService, TicketService, DashboardService, etc.)
│   │   └── ui/                    # Atom UI components (toast notifications, status badges, modals)
│   ├── environments/              # API environment endpoints
│   ├── styles.css                 # Tailwind CSS v4 @theme design system definitions
│   └── index.html                 # HTML entry point with fonts & meta tags
├── angular.json                   # Angular CLI configuration
├── vite.config.ts                 # Vitest test runner configuration
└── README.md                      # Documentation
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: v18.19.0 or higher / v20.x
- **npm**: v9.x or higher
- **Angular CLI**: v22.x (`npm install -g @angular/cli`)

### Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/Eyob73/FixMyCampus_client.git
cd FixMyCampus_client
npm install
```

### Running the Development Server

Start the local development server:

```bash
npm start
# or
ng serve --port 4200
```

Open your browser and navigate to:
👉 **[http://localhost:4200/](http://localhost:4200/)**

The application will automatically reload whenever you modify source files.

---

## 🧪 Testing & Quality Assurance

### Running Unit Tests

Unit tests are powered by **Vitest**:

```bash
# Run all tests once
npm test -- --watch=false

# Run tests in interactive watch mode
npm test
```

### Test Coverage Highlights
- **AuthService**: HTTP authentication requests, token extraction, role validation, unsupported role handling, session clearing, and logout.
- **LoginComponent**: Reactive form validation, password visibility toggles, loading state transitions, error notices, and role redirection.
- **Guards**: `adminGuard` and `roleGuard` authorization rules and fallback routing.

---

## 🏗️ Production Build

To build the optimized production bundle:

```bash
npm run build
# or
ng build --configuration production
```

The output artifacts will be stored in the `dist/FixMyCampus_client` directory.

---

## 🔌 Backend API Integration

The frontend communicates with the FixMyCampus REST API configured in `src/environments/environment.ts`:

- **API Base URL**: `http://localhost:5040/api`

### Authentication Endpoint

`POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "Password123!",
  "rememberMe": true
}
```

**Expected Response Payload:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr-101",
    "name": "Alex Johnson",
    "email": "user@university.edu",
    "role": "ADMIN",
    "isActive": true
  }
}
```

### Supported User Roles

| Role | Target Route | Description |
|---|---|---|
| `ADMIN` | `/admin/dashboard` | Full institutional facilities management & dispatch control |
| `REPORTER` | `/reporter/dashboard` | Campus ticket creation and resolution status tracking |
| `TECHNICIAN` | `/technician/dashboard` | Field technician work order queue & repair updates |

> [!NOTE]
> If the backend returns an unrecognized or unassigned role, the application will not perform an unauthorized navigation redirect. It will log the payload to `console.error` and present an explicit notification to the user requesting administrative assistance.

---

## 💡 Quick Development Preview (Without Backend)

To preview the authenticated dashboards without a running backend service, open Developer Tools Console (`F12` $\rightarrow$ **Console**) at `http://localhost:4200/login` and run:

**Admin Preview:**
```javascript
localStorage.setItem('fmc_auth_token', 'dev-jwt-token');
localStorage.setItem('fmc_auth_user', JSON.stringify({ id: '1', name: 'Campus Admin', email: 'admin@univ.edu', role: 'ADMIN' }));
location.href = '/admin/dashboard';
```

**Reporter Preview:**
```javascript
localStorage.setItem('fmc_auth_token', 'dev-jwt-token');
localStorage.setItem('fmc_auth_user', JSON.stringify({ id: '2', name: 'Student Reporter', email: 'reporter@univ.edu', role: 'REPORTER' }));
location.href = '/reporter/dashboard';
```

**Technician Preview:**
```javascript
localStorage.setItem('fmc_auth_token', 'dev-jwt-token');
localStorage.setItem('fmc_auth_user', JSON.stringify({ id: '3', name: 'Lead Tech', email: 'tech@univ.edu', role: 'TECHNICIAN' }));
location.href = '/technician/dashboard';
```

---

## 📄 License

This project is licensed for university facilities management and campus operations.
© 2025 University Physical Plant & Campus Operations. All rights reserved.
