# StockSense — Business Rules & System Rules

**Document Type:** Rules / Logic Specification  
**Version:** 1.0  
**Source Basis:** `StockSense.pdf`

---

## 1. Source-Mandated Rules
* **R-001 Authentication Required**: Users can register and log in.
* **R-002 OTP Password Reset**: Password reset requires email OTP generation, verification, and new password confirmation.
* **R-003 Dashboard Redirect**: After successful authentication, redirect user to `/dashboard`.
* **R-004 Receipt Increases Stock**: Validating a receipt automatically increases stock at the destination location.
* **R-005 Delivery Decreases Stock**: Validating a delivery order decreases stock from the source location.
* **R-006 Internal Transfer Changes Location**: Moves stock between locations without altering total stock.
* **R-007 Internal Transfer Invariant**: Source decreases by Q, Destination increases by Q. Total company stock remains unchanged.
* **R-008 Physical Count Adjustment**: Adjustment calculates `Difference = Physical Count - Recorded Stock` and updates stock to `Physical Count`.
* **R-009 Adjustments Must Be Logged**: Adjustment entries must be stored in the Stock Ledger.
* **R-010 Internal Movements Must Be Logged**: All movements are logged with source and destination.
* **R-011 Stock Operations Are Ledger-Tracked**: Receipts, Deliveries, Transfers, Adjustments are recorded in Stock Ledger.
* **R-012 Low Stock Alerts**: Triggers when current stock <= reorder level.
* **R-013 Out-of-Stock Visibility**: Triggers when current stock == 0.
* **R-014 Multi-Warehouse Support**: Distinct warehouses with nested locations.
* **R-015 SKU Search**: Fast search by product SKU / code.
* **R-016 Smart Filters**: Compose document type, status, warehouse/location, category.
* **R-017 Dashboard Filter Dimensions**: Type, Status, Warehouse/Location, Category.
* **R-018 Required Status Values**: `Draft`, `Waiting`, `Ready`, `Done`, `Canceled`.
* **R-019 Product Required Fields**: Name, SKU / Code, Category, Unit of Measure, Initial Stock (optional).
* **R-020 Stock Availability Per Location**: Real-time view of inventory by location.
* **R-021 Reordering Rules**: Configurable reorder minimums and targets per product/location.
* **R-022 Receipt Inputs**: Supplier, Products, Received Quantities, Location.
* **R-023 Delivery Workflow**: Pick items, Pack items, Validate, Stock decreases.
* **R-024 Receipt Workflow**: Create, Add supplier & products, Quantities, Validate, Stock increases.
* **R-025 Adjustment Workflow**: Select product/location, Enter counted quantity, Auto-update, Log.

---

## 2. Safeguard & Integrity Rules
* **Atomic Consistency**: Stock modification and Ledger insertion must occur in an ACID database transaction.
* **Insufficient Stock Prevention**: Delivery or Transfer cannot proceed if requested quantity exceeds available stock at the source location.
* **Positive Movement**: Receipts, Deliveries, and Transfers must have positive non-zero quantities.
* **Distinct Locations**: Internal transfer source location cannot be identical to destination location.
* **Historical Immutability**: Ledger events cannot be modified or deleted.
