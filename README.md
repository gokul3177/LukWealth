# 💰 Finance Backend System

## 📌 Overview

This project is a backend system for a finance dashboard that manages financial records, user roles, and summary analytics.

It demonstrates API design, role-based access control, and data aggregation.

---

## 🚀 Tech Stack

* Node.js
* Express.js
* SQLite (for simplicity and reliability)

---

## ⚙️ Setup Instructions

1. Clone the repository

2. Install dependencies:
   npm install

3. Start the server:
   node server.js

Server runs at:
http://localhost:4000

---

## 👤 Roles & Permissions

| Role    | Access                               |
| ------- | ------------------------------------ |
| Viewer  | Read-only access to records          |
| Analyst | View records + summary analytics     |
| Admin   | Full access (create, update, delete) |

Role is passed via request header:
role: admin / analyst / viewer

---

## 📡 API Endpoints

### Users

* POST /users → Create user
* GET /users → Get all users

### Records

* POST /records → Create record (Admin only)
* GET /records → Get records (All roles)
* PUT /records/:id → Update record (Admin only)
* DELETE /records/:id → Delete record (Admin only)

### Summary

* GET /summary → Total income, expenses, balance (Analyst/Admin)
* GET /summary/category → Category-wise totals

---

## 📊 Features Implemented

* Role-based access control using middleware
* Financial records CRUD operations
* Aggregated summary APIs
* Input validation and error handling
* Lightweight SQLite database for easy setup

---

## 💡 Notes

SQLite is used for simplicity and to ensure the project runs without external dependencies.

In production systems, PostgreSQL or MySQL would be preferred for scalability and reliability.

---

## 🏁 Conclusion

This project focuses on clean backend design, logical structure, and real-world use-case implementation.
