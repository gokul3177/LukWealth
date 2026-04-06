# 🏦 LukWealth Finance

A secure, multi-tenant financial management and audit platform with Role-Based Access Control (RBAC), personalized dashboards, and enterprise-grade analytics.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Role & Permission Matrix](#role--permission-matrix)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [User Journey](#user-journey)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

LukWealth is an enterprise-grade financial management platform that provides:

- **Multi-tenant architecture** with strict data isolation
- **Hierarchical role-based access control** (Admin > Analyst > User)
- **Dual-mode dashboards** (Personal Wallet + Global Monitor)
- **Comprehensive audit trails** with read-only inspection mode
- **Smart UI controls** that prevent unauthorized actions

---

## ✨ Key Features

### 🔐 Gatekeeper Authentication

**Secure Onboarding Process**
- New users register and enter a `pending` state by default
- Admin or Analyst approval required before dashboard access
- Personalized identity enforcement with "Welcome, [Name]" headers and role badges

### 📊 Dual-Mode Dashboards

**Personal Wallet (Default View)**
- Private financial activity for individual users
- Ensures data consistency during audits
- Displays personal balance, income, and expenses

**Global Monitor (Admin/Analyst Toggle)**
- System-wide aggregated financial insights
- Total balance, income, and expenses across all users
- One-click toggle between personal and global views

### 🛡️ Advanced RBAC & User Registry

**Centralized User Management**
- User Registry hub for account administration
- Audit Mode: Inspect any user's financial profile without modification rights
- Hierarchical permissions prevent unauthorized overrides

**Account Management Capabilities**
- **Admins**: Full control - activate, deactivate, and delete any account
- **Analysts**: Manage standard Users only (cannot modify Admin accounts)
- **Users**: Self-service personal finance management

### 💎 Data Integrity & Ownership

**Ownership-Based Controls**
- Update or delete only records you personally created
- Smart UI: Delete icons appear only on records you own
- Prevents unauthorized modifications and 403 errors

**Privacy Protection**
- Analysts cannot audit other Analysts or Admins
- Strict hierarchical access enforcement
- Audit mode is read-only to preserve data integrity

---

## 👥 Role & Permission Matrix

| Capability | Admin | Analyst | User |
|:-----------|:-----:|:-------:|:----:|
| **Personal Dashboard** | ✅ | ✅ | ✅ |
| **Add/Delete Own Records** | ✅ | ✅ | ✅ |
| **View Global Statistics** | ✅ | ✅ | ❌ |
| **Access User Registry** | ✅ | ✅ | ❌ |
| **Audit Other Users** | ✅ | ✅ (Users only) | ❌ |
| **Activate/Deactivate Accounts** | ✅ | ✅ (Users only) | ❌ |
| **Delete User Accounts** | ✅ | ❌ | ❌ |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Charts**: Recharts (Visual Analytics)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens) with personalized metadata
- **Database**: SQLite with production-ready schema and hierarchy-aware triggers

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/gokul3177/LukWealth.git
   cd LukWealth
```

2. **Install dependencies**
```bash
   npm install
```

### Backend Setup

1. **Navigate to backend directory**
```bash
   cd backend
   npm install
```

2. **Configure environment variables**
   
   Create a `.env` file in the backend directory:
```env
   JWT_SECRET=your_secret_key_here
   PORT=5000
```

3. **Start the backend server**
```bash
   node server.js
```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
   cd frontend
   npm install
```

2. **Start the development server**
```bash
   npm run dev
```

   The app will run on `http://localhost:5173` (or the port shown in terminal)

---

## 🎯 User Journey

### 🟢 Phase 1: Registration (The Gatekeeper)

**New User Registration**
1. Navigate to the Sign Up page
2. Enter name, email, and password
3. Choose desired role (Admin, Analyst, or User)
4. Account created in `pending` status

**Access Restriction**
- Cannot log in until approved
- Professional message displayed: *"Your account is awaiting Admin approval. Please check back later."*

---

### 🔵 Phase 2: Account Approval

**Admin/Analyst Workflow**
1. Log in with an authorized account
2. Click the **Registry** button
3. Locate the pending user
4. Click **Activate** to grant access

**Hierarchical Security**
- Analysts can activate/deactivate **Users only**
- Only Admins can manage other Admins
- Prevents privilege escalation

---

### 👤 Phase 3: User Experience (Personal Wallet)

**Dashboard Access**
1. Log in with activated credentials
2. Greeted with: *"Welcome, [Name] (USER)"*
3. View personal "My Wallet" dashboard

**Financial Management**
- Click **+ Add Record** to log income/expenses
- View personal balance, income, and expenses
- Update or delete only your own records
- Complete data privacy from other users

---

### 📈 Phase 4: Overseer Experience (Global Monitor)

**Admin/Analyst Capabilities**
1. Start at Personal Wallet view
2. Access **"View Global Stats"** toggle
3. Switch to System Total view

**Global Dashboard Features**
- Aggregated income and expenses across all users
- System-wide financial metrics
- Smart privacy: Cannot delete others' records
- Toggle back to personal view anytime

---

### 🛡️ Phase 5: Audit Mode (Admin Only)

**Financial Investigation**
1. Navigate to **Registry**
2. Click on a user's name
3. Dashboard switches to **Audit Mode** (blue banner)

**Audit Capabilities**
- View user's complete financial trail
- See their specific records, balance, and trends
- Read-only mode (no add/delete during audit)
- Preserves audit integrity

---

## 📁 Project Structure
<img width="532" height="394" alt="image" src="https://github.com/user-attachments/assets/8a576f12-3a71-4501-8423-9fb52d4698b1" />

---

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with secure token management
- Role-based access control (RBAC) with hierarchical permissions
- Pending account approval workflow

### Data Protection
- Ownership-based record access
- Read-only audit mode
- Privacy guards between user tiers
- Frontend and backend permission validation

### Database Security
- SQLite with prepared statements (SQL injection prevention)
- Hierarchy-aware triggers
- Data integrity constraints

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/gokul3177/LukWealth/issues)
- Contact: [gokulakumaran3281@gmail.com]

---

## 🏁 Summary

**LukWealth delivers a complete enterprise financial ecosystem:**

✅ **Users** manage their personal finances securely  
✅ **Analysts** oversee users and monitor global metrics  
✅ **Admins** audit anyone and secure the entire platform  

A professional-grade solution for multi-tenant financial management with comprehensive RBAC, audit trails, and data integrity controls.

---
** Working video will be uploaded soon **


**Built with ❤️ by the LukWealth Team**
