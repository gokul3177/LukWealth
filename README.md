# 🏦 LukWealth Finance

LukWealth is a secure, multi-tenant financial management and audit platform. It features a robust **Role-Based Access Control (RBAC)** system, a personalized dashboard experience, and high-level analytical tools for enterprise-grade financial monitoring.

---

## 🚀 Core Features

### 🔐 1. Gatekeeper Authentication
- **Secure Registration**: New users enter a `pending` state by default.
- **Admin Approval**: Accounts must be manually activated by an **Admin** or **Analyst** before the dashboard can be accessed.
- **Identity Enforcement**: Every dashboard is personalized with a "Welcome, [Name]" header and role-specific badges.

### 📊 2. Dual-Mode Dashboards
- **Personal Wallet (Default)**: Everyone starts by seeing their own personal financial activity. This ensures data consistency during audits.
- **Global Monitor (Toggle)**: Admins and Analysts can toggle into "System Global" mode to see aggregated financial insights for the entire organization (Total Balance, Income, and Expenses).

### 🛡️ 3. Advanced RBAC & Registry
- **User Registry**: A centralized management hub where high-level roles can manage the user base.
- **Audit Mode**: Admins can click on any user in the registry to "Audit" their specific financial profile, viewing their individual transaction trail without high-level totals.
- **Account Management**: 
    - **Admins**: Can activate/deactivate any user and delete accounts.
    - **Analysts**: Can manage standard Users but cannot override Admin-level deactivations.

### 💎 4. Data Integrity & "Self-Management"
- **Ownership Logic**: You can only `Update` or `Delete` records that you personally created. 
- **Smart UI**: The "Trash" icon only appears on records you own, preventing unauthorized modification attempts and 403 errors.
- **Privacy Guard**: Analysts are strictly blocked from auditing other Analysts or Admins.

---

## 👤 Role & Permission Matrix

| Feature | Admin | Analyst | User |
| :--- | :---: | :---: | :---: |
| **Personal Dashboard** | ✅ | ✅ | ✅ |
| **Add/Delete Own Records** | ✅ | ✅ | ✅ |
| **View Global Stats** | ✅ | ✅ | ❌ |
| **User Registry Access** | ✅ | ✅ | ❌ |
| **Audit Other Users** | ✅ | ✅ (Users only) | ❌ |
| **Activate/Deactivate Users** | ✅ | ✅ (Users only) | ❌ |
| **Delete Users** | ✅ | ❌ | ❌ |

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Recharts (Visual Analytics), Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Security**: JWT (JSON Web Tokens) with personalized metadata.
- **Database**: SQLite (Production-ready schema with hierarchy-aware triggers).

---

## ⚙️ Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/gokul3177/LukWealth.git
npm install
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with JWT_SECRET=your_secret_key
node server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🏁 Conclusion
LukWealth demonstrates a complete "Enterprise Financial" workflow—from secure onboarding and role-aware navigation to high-level auditing and data integrity. It is designed to be a reliable "Home Base" for both individual users and financial overseers.
