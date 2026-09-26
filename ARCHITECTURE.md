# StockSense — System Architecture

**Document Type:** System Architecture  
**Version:** 1.0  
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Node.js/Express + Prisma ORM + SQLite (ACID Transactions)

---

## 1. High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                      StockSense Frontend (SPA)                 │
│  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons    │
│  • AppShell (Sidebar, Topbar, Alerts, Profile)                  │
│  • Dashboard (KPIs, Dynamic Filter Bar, Operational Feeds)      │
│  • Product Suite (Catalog, Location Availability, Reorder)      │
│  • Operations (Receipts, Deliveries, Transfers, Adjustments)    │
│  • Move History / Stock Ledger                                  │
│  • Settings (Warehouses & Locations)                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │ REST API / JSON (with Auth Bearer)
┌────────────────────────────────▼────────────────────────────────┐
│                   StockSense Backend API Engine                 │
│  Node.js + Express + TypeScript                                 │
│  • Auth Module (JWT + bcrypt + In-memory/DB OTP engine)         │
│  • Product & Category Domain                                    │
│  • Warehouse & Location Domain                                  │
│  • Inventory Domain & Stock Balance Calculator                  │
│  • Operations Processors (Receipt, Delivery, Transfer, Adjust)  │
│  • Stock Ledger Service (ACID Transaction with Inventory Update)│
│  • Dashboard & Analytics Aggregator                             │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Prisma Client (ACID Transactions)
┌────────────────────────────────▼────────────────────────────────┐
│                       SQLite Database Engine                    │
│  Structured Relational Schema:                                  │
│  Users, Products, Categories, Units, Warehouses, Locations,     │
│  InventoryBalances, Receipts, Deliveries, Transfers,           │
│  Adjustments, StockLedgerEntries, ReorderingRules, OTPCodes     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Inventory Transaction Invariants

1. **Receipt Validation**:
   - `InventoryBalance[product_id, destination_location_id] += quantity`
   - `StockLedgerEntry(type='RECEIPT', qty=+quantity, to=destination_location_id)`
   - Status transitions to `DONE`.

2. **Delivery Validation**:
   - Verify `InventoryBalance[product_id, source_location_id] >= quantity`. If insufficient, reject with HTTP 400.
   - `InventoryBalance[product_id, source_location_id] -= quantity`
   - `StockLedgerEntry(type='DELIVERY', qty=-quantity, from=source_location_id)`
   - Status transitions to `DONE`.

3. **Internal Transfer Validation**:
   - Verify `source_location_id != destination_location_id`.
   - Verify `InventoryBalance[product_id, source_location_id] >= quantity`.
   - `InventoryBalance[product_id, source_location_id] -= quantity`
   - `InventoryBalance[product_id, destination_location_id] += quantity`
   - Total company stock delta is strictly `0`.
   - `StockLedgerEntry(type='INTERNAL_TRANSFER', qty=quantity, from=source_location_id, to=destination_location_id)`
   - Status transitions to `DONE`.

4. **Inventory Adjustment Validation**:
   - `difference = physical_count - current_recorded_stock`
   - `InventoryBalance[product_id, location_id] = physical_count`
   - `StockLedgerEntry(type='ADJUSTMENT', qty=difference, location=location_id)`
   - Status transitions to `DONE`.

All inventory updates and ledger entries are executed inside a single atomic `prisma.$transaction`.
