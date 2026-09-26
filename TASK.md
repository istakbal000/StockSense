# StockSense — Master Task Checklist

- [x] **PHASE 0: Project Setup & Application Shell**
  - [x] Initialize repository structure with backend (Node.js/Express/TypeScript/Prisma) and frontend (React/Vite/TypeScript/Tailwind CSS).
  - [x] Configure database schema with SQLite and Prisma migrations.
  - [x] Seed database with initial categories, units of measure, warehouses, locations, test users, and products.
  - [x] Implement responsive AppShell layout (Sidebar, Topbar, Alerts indicator, Profile menu, Navigation).

- [x] **PHASE 1: Authentication & Authorization**
  - [x] User Sign Up API & UI with validation.
  - [x] User Login API & UI with JWT token handling.
  - [x] OTP Password Reset (Forgot Password -> Generate OTP -> Verify OTP -> Reset Password).
  - [x] Protected route guarding and redirection to `/dashboard`.
  - [x] Profile viewing & Logout functionality.

- [x] **PHASE 2: Product & Warehouse Management**
  - [x] Product creation & updating (Name, SKU/Code, Category, Unit of Measure, Initial Stock).
  - [x] Stock availability per location view.
  - [x] Categories management.
  - [x] Reordering rules configuration (Reorder Level, Target Level).
  - [x] Warehouse & Location settings management.

- [x] **PHASE 3: Core Inventory Engine & Stock Ledger**
  - [x] Inventory balance calculation service.
  - [x] Atomic Stock Ledger engine supporting transactions.
  - [x] Negative/insufficient stock safeguards.

- [x] **PHASE 4: Receipts (Incoming Stock)**
  - [x] Receipt creation (Supplier, Destination Location, Line Items).
  - [x] Receipt validation triggering automatic stock increase & ledger entry.
  - [x] Receipt status tracking (Draft, Waiting, Ready, Done, Canceled).

- [x] **PHASE 5: Delivery Orders (Outgoing Stock)**
  - [x] Delivery order creation (Customer/Shipment, Source Location, Line Items).
  - [x] Workflow steps: Pick items -> Pack items -> Validate.
  - [x] Delivery validation with insufficient stock verification, automatic stock decrease & ledger entry.

- [x] **PHASE 6: Internal Transfers**
  - [x] Transfer creation (Product, Source Location, Destination Location, Quantity).
  - [x] Validation ensuring Source != Destination, source stock decrease, destination stock increase, total stock invariant.
  - [x] Transfer ledger entry.

- [x] **PHASE 7: Inventory Adjustments**
  - [x] Adjustment creation (Product, Location, Recorded Stock, Physical Count).
  - [x] Difference calculation (`Physical Count - Recorded Stock`).
  - [x] Stock adjustment application & ledger entry.

- [x] **PHASE 8: Dashboard & Dynamic Filters**
  - [x] Real-time KPI cards: Total Products in Stock, Low/Out-of-Stock, Pending Receipts, Pending Deliveries, Scheduled Transfers.
  - [x] Dynamic multi-dimensional filtering (Document Type, Status, Warehouse/Location, Category).
  - [x] Low-stock and out-of-stock visibility and alert badges.

- [x] **PHASE 9: SKU Search, Smart Filters & Move History**
  - [x] Instant SKU and keyword search.
  - [x] Dedicated Move History / Stock Ledger page with filtering and full audit trail.

- [x] **PHASE 10: Profile & Warehouse Settings**
  - [x] User Profile UI and details.
  - [x] Warehouse and Location management interface in Settings.

- [x] **PHASE 11: End-to-End Validation**
  - [x] Verify Step 1: Create Steel (kg).
  - [x] Verify Step 2: Receive 100 kg Steel -> Stock +100.
  - [x] Verify Step 3: Transfer 40 kg from Main Store to Production Rack -> Main Store: 60, Production: 40, Total: 100.
  - [x] Verify Step 4: Deliver 20 kg -> Production: 20, Total: 80.
  - [x] Verify Step 5: Adjust damaged 3 kg -> Stock decreases by 3 -> Total: 77.
  - [x] Verify Step 6: Verify all ledger entries and move history.

- [x] **PHASE 12: Source Compliance Audit**
  - [x] Complete checklist against `PRD.md`, `RULES.md`, and `StockSense.pdf`.
