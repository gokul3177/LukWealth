# Backend Refactoring Changelog

*This document meticulously tracks all backend and frontend changes executed to satisfy the assignment rubric.*

---

## [Phase 1] User Management & Admin Access
**Completed**
1. **Added `updateUserStatus` to `userController.js`**: Created an endpoint for Admins to toggle a user between `active` and `inactive` states.
2. **Secured Account Login in `userController.js`**: Patched the `loginUser` controller so that if a user's status is `inactive`, the backend blocks the login and returns a strictly formatted 403 Forbidden error response natively.
3. **Protected User Routes (`userRoutes.js`)**: Wrapped the `GET /users`, `POST /users`, and `PUT /users/:id/status` endpoints in `verifyToken` and `checkRole(["admin"])`. Now, only designated Admins can perform user management duties.

## [Phase 2] Strict Access Control
**Completed**
1. **Admin-Only CRUD**: Updated `recordRoutes.js` to restrict POST, PUT, and DELETE HTTP verbs so only accounts with the `admin` role can mutate records.
2. **Lifted ID Constraints**: Modified `recordController.js` to remove the `AND userId = ?` constraint on Update and Delete controllers, because Admins inherently act on data globally.

## [Phase 3] Financial Records Filtering
**Completed**
1. **Dynamic Query Params**: Refactored the `getRecords` controller to gracefully build a `WHERE 1=1` SQL query. It now dynamically appends conditions if the client passes `type`, `category`, `startDate`, or `endDate` in the URL query string.
2. **Added Sorting**: Enforced an `ORDER BY date DESC` rule on the payload so the frontend naturally sees the most recent financial activity first.

## [Phase 4] Advanced Summary & Trends APIs
**Completed**
1. **Monthly Trends Aggregation**: Created a native SQLite grouped query in `summaryController.getTrends()` using `strftime`, enabling the backend to calculate aggregate income and expenses distinctly by month.
2. **Secured Route**: Mapped the endpoint to `/summary/trends` and restricted it to `analyst` and `admin` only, satisfying the aggregation requirements.

## [Phase 5] Error Handling & Validation
**Completed**
1. **Defensive Programming**: Injected strict type-checking logic early in the execution flow for `createRecord` and `updateRecord` controllers. It explicitly verifies that `amount` parses successfully to a Float, and strictly enforces that `type` behaves as an Enum matching exactly `income` or `expense`, returning `400 Bad Request` securely if broken.

## [PIVOT] New Role Architecture & Helpdesk
**Completed**
1. **Re-enabled User CRUD**: Standard users can once again manage their own financial footprints, restoring their localized autonomy.
2. **Empowered Analysts**: Bound the `/users/:id/status` endpoint to Analysts so they can trigger account suspensions in the event of fraudulent activity on the client platform.
3. **New Hardware**: Fully migrated the SQLite architecture to include a `queries` table, accompanied by a `queryController` and a UI `<QueryPanel />` to support customer assistance tickets seamlessly.
