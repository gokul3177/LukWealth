# 🏦 LukWealth — Enterprise-Grade Finance Tracker & Audit Platform

LukWealth is a secure, multi-tenant financial management and auditing application. Designed with strict data isolation, hierarchical Role-Based Access Control (RBAC), and gorgeous data visualizations, it offers users a powerful way to manage personal transactions while providing admins and analysts with oversight and inspection capabilities.

---

## 🚀 Key Highlights & System Architecture

- **Secure Gatekeeper Authentication**: New users register and land in a `pending` state, requiring approval from an Administrator or Analyst before access is granted.
- **Hierarchical RBAC**: Strict system boundaries separate **Admins**, **Analysts**, and **Users**.
- **Dual-Mode Dashboards**: Transition instantly between your **Personal Wallet** and the **Global Monitor** (Admin/Analyst toggle) to view system-wide aggregated metrics.
- **Read-Only Audit Mode**: Admins and Analysts can inspect a user's transaction history in a dedicated read-only mode, guaranteeing data integrity.
- **Modern Responsive Design**: Built with a sleek Tailwind CSS UI featuring full dark mode support, glassmorphic accents, micro-animations, and responsive layouts.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (v19)
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Icons**: Lucide React
- **Analytics & Graphs**: Recharts

### Backend
- **Server**: Node.js & Express.js
- **Database**: SQLite3 with triggers for audit logging and data integrity
- **Security**: JSON Web Tokens (JWT) & bcryptjs (password hashing)
- **Orchestration**: Concurrently (to manage multi-prefix dev processes)

---

## 📊 Role & Permission Matrix

| Capability | Administrator | Financial Analyst | Standard User |
| :--- | :---: | :---: | :---: |
| **Manage Personal Dashboard** | ✅ | ✅ | ✅ |
| **Add / Delete Own Records** | ✅ | ✅ | ✅ |
| **Toggle Global Monitor** | ✅ | ✅ | ❌ |
| **Access User Registry** | ✅ | ✅ (Users only) | ❌ |
| **Audit Other Users (Read-Only)** | ✅ | ✅ (Users only) | ❌ |
| **Activate / Deactivate Accounts** | ✅ | ✅ (Users only) | ❌ |
| **Permanently Delete Accounts** | ✅ | ❌ | ❌ |

---

## 📁 Project Structure

```text
LukWealth/
├── backend/
│   ├── db/                 # SQLite database and migrations
│   ├── routes/             # Express API routes (users, records, summaries)
│   ├── package.json        # Backend dependencies & scripts
│   └── server.js           # Express main server entrypoint
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views (Dashboard, Login, Register, AddRecord, etc.)
│   │   ├── utils/          # API hooks and axios client
│   │   ├── App.jsx         # App router and theme provider
│   │   └── index.css       # Core design system and utilities
│   ├── package.json        # Frontend dependencies & configurations
│   └── vite.config.js      # Vite configurations & API proxies
├── .env                    # Shared environment variables
├── package.json            # Root configuration for orchestration
└── README.md               # You are here!
```

---

## ⚡ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git

### 1. Clone and Navigate
```bash
git clone https://github.com/gokul3177/LukWealth.git
cd LukWealth
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
JWT_SECRET=your_super_secure_jwt_secret_key
PORT=4000
```

### 3. Install All Dependencies
Install root, backend, and frontend dependencies with a single command:
```bash
npm run install:all
```

### 4. Run the Development Server
Start the Express backend and Vite frontend concurrently:
```bash
npm run dev
```
- **Frontend** will start on: `http://localhost:5173`
- **Backend** will run on: `http://localhost:4000`

---

## 🔐 Core Workflows & User Journeys

### 🟢 Phase 1: Onboarding (Pending Verification)
1. A new user registers via the **Sign Up** page, selecting their desired role (User, Analyst, or Admin).
2. The account is created with a `pending` status.
3. Upon attempting to log in, the user sees a notification: *"Your account is awaiting Admin approval. Please check back later."*

### 🔵 Phase 2: User Verification & Registry Management
1. An Admin or Analyst logs in.
2. They navigate to the **Registry** section.
3. They activate the pending user account. 
4. *Note: Analysts can only approve or deactivate standard Users. Only Admins can manage other Admin accounts.*

### 👤 Phase 3: Personal Wallet
1. Once activated, the user logs in and is greeted with their custom home dashboard.
2. They can view, create, and delete their own financial records (income & expenses).
3. The interface displays beautiful Recharts visual breakdowns of their personal cash flow.

### 📈 Phase 4: Global Monitor
1. Admins and Analysts have access to a dashboard toggle to switch from **My Wallet** to **Global Monitor**.
2. This displays aggregate system-wide stats (total platform cash flow, total users, system-wide metrics).
3. Critical action safeguards ensure they cannot delete other users' records directly from this view.

### 🛡️ Phase 5: Inspections & Audits
1. Admins and Analysts can click any activated user's name in the Registry.
2. This transitions the dashboard into a **Read-Only Audit Mode** (indicated by a distinct blue banner).
3. The auditor can review the complete history and charts of that specific user, with creation/deletion operations safely disabled.

---

## 🔒 Security Features & Data Protections

- **Data Isolation**: Database queries enforce record ownership constraints at both API and SQLite levels.
- **Route Guards**: Frontend React Router paths and Backend Express endpoints are protected by state-aware JWT checks.
- **SQL Injection Prevention**: SQLite uses prepared statements and parameterized queries for all operations.
- **Approval Gating**: Prevents unauthorized registrations from accessing any endpoints or visual UI dashboards.

---

## 🤝 Contributing

We welcome contributions to LukWealth!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📞 Support & Feedback

For issues or feature requests, feel free to open a ticket on our [GitHub Issues](https://github.com/gokul3177/LukWealth/issues) or reach out via email: [gokulakumaran3281@gmail.com].
