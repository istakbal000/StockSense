# StockSense — Modular Inventory Management System

StockSense is an end-to-end, production-style Inventory Management System (IMS) engineered to replace manual registers and spreadsheets with centralized, real-time stock control and complete Stock Ledger traceability.

---

## 🚀 Live Running Services

- **Frontend Client (Vite + React + Tailwind CSS)**: [http://localhost:5173](http://localhost:5173)
- **Backend API (Express + Prisma + SQLite)**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔐 Demo Credentials

Quick demo login buttons are provided on the login screen, or you can enter:

| Role | Email | Password |
|---|---|---|
| **Inventory Manager** | `manager@stocksense.com` | `password123` |
| **Warehouse Staff** | `staff@stocksense.com` | `password123` |

---

## 🛠️ Architecture & Core Invariants

1. **Receipts (Incoming Goods)**:
   - Validating a receipt automatically increases stock at the destination location and writes a `RECEIPT` event to the **Stock Ledger**.
2. **Delivery Orders (Outgoing Goods)**:
   - Features Pick & Pack stages. Validating an order checks stock availability (rejecting if insufficient), decreases stock from the source location, and writes a `DELIVERY` event to the **Stock Ledger**.
3. **Internal Transfers**:
   - Moves inventory between locations. Source decreases by `Q`, Destination increases by `Q`. Total company stock is **strictly preserved (delta = 0)**, and an `INTERNAL_TRANSFER` event is logged.
4. **Inventory Adjustments**:
   - Reconciles recorded system stock with counted physical stock. Automatically computes `Difference = Physical Count - Recorded Stock`, updates stock to the physical count, and writes an `ADJUSTMENT` event to the **Stock Ledger**.
5. **Dashboard & KPIs**:
   - Computes all 5 source KPIs in real time: Total Products in Stock, Low/Out-of-Stock alerts, Pending Receipts, Pending Deliveries, and Scheduled Transfers. Dynamic multi-dimensional filtering by Document Type, Status, Warehouse/Location, and Category.
6. **Stock Ledger & Move History**:
   - Immutable audit trail documenting every single stock modification with date, reference doc, locations, and user details.

---

## 🧪 Running the End-to-End Test Suite

To run the automated verification script that executes the complete test sequence from Section 49:

```bash
cd server
npx tsx test_end_to_end.ts
```
