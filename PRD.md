# StockSense — Product Requirements Document (PRD)

**Document Type:** Product Requirements Document  
**Product:** StockSense  
**Version:** 1.0  
**Source of Truth:** StockSense problem statement (`StockSense.pdf`)

---

## 1. Product Overview
StockSense is a modular Inventory Management System (IMS) designed to digitize and streamline all stock-related operations within a business. It replaces manual registers, Excel sheets, and scattered tracking methods with a centralized, real-time, easy-to-use application.

The central operating principle is that every inventory-changing activity is recorded and traceable through the **Stock Ledger**.

---

## 2. Target Users
* **Inventory Managers**: Manage incoming stock (Receipts), outgoing stock (Delivery Orders), oversee inventory operations, and monitor stock status/alerts via the dashboard.
* **Warehouse Staff**: Perform transfers between locations, picking, shelving, and physical counting/adjustments.

---

## 3. Product Goals & Core Capabilities
1. Centralize stock-related operations.
2. Provide a real-time dashboard snapshot of inventory operations and KPIs.
3. Allow creation, updating, and viewing of products with SKU, category, UoM, and initial stock.
4. Show stock availability per location and per warehouse.
5. Support product categories and configurable reordering rules.
6. Support incoming stock through Receipts with supplier & product details, validated stock increase.
7. Support outgoing stock through Delivery Orders with pick & pack workflow and validated stock decrease.
8. Support Internal Transfers across locations preserving total company stock.
9. Support Inventory Adjustments comparing recorded vs physical counts with automatic correction.
10. Maintain a comprehensive, immutable Move History / Stock Ledger.
11. Multi-warehouse and multi-location hierarchy support.
12. Low-stock and out-of-stock visibility and alerts.
13. Fast SKU search and multi-dimensional smart filters.

---

## 4. Authentication Requirements
* **Sign Up**: Create user account with name, email, password, and role.
* **Login**: Authenticate with email/password.
* **OTP-Based Password Reset**: Request OTP, verify OTP, and reset password.
* **Post-Login Redirect**: Redirect directly to `/dashboard`.
* **Session Management**: Secure token/session with logout support.

---

## 5. Dashboard Requirements
* **KPIs**:
  1. Total Products in Stock
  2. Low Stock / Out of Stock Items
  3. Pending Receipts
  4. Pending Deliveries
  5. Internal Transfers Scheduled
* **Dynamic Filters**:
  * Document Type (Receipts, Delivery, Internal, Adjustments)
  * Status (Draft, Waiting, Ready, Done, Canceled)
  * Warehouse / Location
  * Product Category
* **Alerts**:
  * Low Stock alert list
  * Out of Stock alert list

---

## 6. Product Management
* Fields: Name, SKU / Code, Category, Unit of Measure, Initial Stock (optional).
* Actions: Create, Update, List, Detail, Stock Availability by Location, Reordering Rules.
* Search: SKU & Name quick search.

---

## 7. Core Inventory Operations
1. **Receipts (Incoming)**: Draft -> Waiting/Ready -> Validate -> Stock +Qty at destination location -> Ledger entry.
2. **Delivery Orders (Outgoing)**: Draft -> Pick -> Pack -> Validate -> Stock -Qty at source location -> Ledger entry. (Validation rejected if stock insufficient).
3. **Internal Transfers**: Source Location -> Destination Location -> Validate -> Source -Qty, Destination +Qty (Total stock unchanged) -> Ledger entry.
4. **Inventory Adjustments**: Physical count vs Recorded count -> Difference applied -> Stock updated to Physical Count -> Ledger entry.

---

## 8. Stock Ledger & Move History
Every validated operation generates an immutable Stock Ledger entry:
* Timestamp, Movement Type, Product, Quantity (+/-), From Location, To Location, Reference Document, User.
