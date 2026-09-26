# StockSense — Product & UI Design Specification

**Document Type:** UI / UX Design Specification  
**Version:** 1.0  
**Design Aesthetic:** Modern Enterprise / Sleek Dark-Accented Theme, Glassmorphism, Emerald & Indigo Accents, Lucid Micro-interactions

---

## 1. Information Architecture & Navigation

```text
Dashboard

Products
 ├── Products (List & Management)
 ├── Stock Availability (Location Breakdown)
 ├── Categories
 └── Reordering Rules

Operations
 ├── Receipts (Incoming Goods)
 ├── Delivery Orders (Outgoing Goods - Pick/Pack/Validate)
 ├── Internal Transfers (Between Locations)
 ├── Inventory Adjustments (Physical Count Reconciliation)
 └── Move History (Searchable Stock Ledger)

Settings
 └── Warehouse (Warehouses & Locations Configuration)

Profile
 ├── My Profile
 └── Logout
```

---

## 2. Key Screen Specifications

### 2.1 Dashboard
* **KPI Row**:
  - `Total Products in Stock` (Total quantity and unique SKUs)
  - `Low Stock / Out of Stock Items` (Items below reorder thresholds)
  - `Pending Receipts` (Draft / Waiting / Ready receipts)
  - `Pending Deliveries` (Draft / Waiting / Ready deliveries)
  - `Internal Transfers Scheduled` (Scheduled transfers)
* **Dynamic Filter Bar**:
  - Document Type: All, Receipts, Delivery, Internal, Adjustments
  - Status: All, Draft, Waiting, Ready, Done, Canceled
  - Warehouse / Location
  - Product Category
  - Text Search (SKU / Reference / Supplier)
* **Active Alert Panel**:
  - Quick badges for Low Stock and Out of Stock items with quick links to receipts/reorder.

### 2.2 Products UI
* Filterable table with Name, SKU, Category, UoM, Total Stock, Location Details modal/drawer, Reorder status.
* Product Creation modal/page supporting Name, SKU/Code, Category, Unit of Measure, Initial Stock (optional with warehouse selection).

### 2.3 Operations UIs
* **Receipts**: Create receipt with Supplier, Destination Location, Line Items (Product, Quantity). Validation triggers instant stock increase + ledger entry.
* **Delivery Orders**: Customer/Shipment details, Source Location, Line Items. Interactive 3-stage flow: `Pick` items -> `Pack` items -> `Validate` -> Stock reduction. Insufficient stock safeguard warnings.
* **Internal Transfers**: Source Location selector, Destination Location selector, Product selector, Available Quantity indicator, Transfer Quantity input. Validation updates both locations atomically.
* **Adjustments**: Product & Location picker, displays Recorded Stock, input for Physical Count, auto-computes Difference (+ / -), Apply creates adjustment record + ledger entry.

### 2.4 Move History & Stock Ledger
* Traceable table: Date/Time, Reference Doc, Movement Type, Product Name & SKU, Quantity change, From Location, To Location, Responsible User, Status. Filterable by Type, Date, Product.

### 2.5 Warehouse Settings
* Management of Warehouses (e.g. Main Warehouse, Warehouse 2) and Locations (e.g. Rack A, Rack B, Production Floor).
