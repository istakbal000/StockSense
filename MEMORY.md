# StockSense — Implementation Memory & Context

**Project:** StockSense Modular Inventory Management System  
**Created:** 2026-09-26  
**Status:** In Active Development  

## Tech Stack Decisions:
- **Backend**: Express + TypeScript + Prisma ORM + SQLite (`file:./dev.db`). Provides strict schema, ACID transaction rollback for stock mutations, and zero-dependency reliability on local Windows.
- **Frontend**: Vite + React 18 + TypeScript + Tailwind CSS + Lucide React.
- **Authentication**: JWT token storage + Bcrypt password hashing + Development OTP generator with in-app OTP preview/display for effortless testing.
- **State & Data Synchronization**: Real-time optimistic & invalidation hooks that keep dashboard metrics, stock levels, and operations synchronized without page reloads.

## Source Rules Reference:
- Receipts: validate -> stock increase at destination -> ledger entry.
- Deliveries: pick/pack workflow -> validate -> stock decrease from source -> ledger entry.
- Internal Transfers: source -Q, dest +Q, total invariant = 0 -> ledger entry.
- Adjustments: `difference = physical - recorded`, stock = physical -> ledger entry.
- Initial stock is optional during product creation; if provided, records INITIAL_STOCK in ledger.
