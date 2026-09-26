export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  _count?: { products: number };
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  locations?: Location[];
}

export interface Location {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  type: string;
  warehouse?: Warehouse;
  balances?: InventoryBalance[];
}

export interface InventoryBalance {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  location?: Location;
  product?: Product;
}

export interface ReorderingRule {
  id: string;
  productId: string;
  locationId?: string | null;
  minQuantity: number;
  maxQuantity?: number | null;
  targetQuantity?: number | null;
  location?: Location;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  unitOfMeasureId: string;
  initialStock?: number;
  totalStock?: number;
  reorderMin?: number;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  category?: Category;
  unitOfMeasure?: UnitOfMeasure;
  balances?: InventoryBalance[];
  reorderingRules?: ReorderingRule[];
  ledgerEntries?: StockLedgerEntry[];
}

export interface ReceiptItem {
  id?: string;
  productId: string;
  quantity: number;
  notes?: string;
  product?: Product;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  supplierName: string;
  destinationLocationId: string;
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
  notes?: string;
  validatedAt?: string;
  createdAt: string;
  destinationLocation?: Location;
  items?: ReceiptItem[];
  createdByUser?: { id: string; name: string };
}

export interface DeliveryItem {
  id?: string;
  productId: string;
  quantity: number;
  pickedQuantity: number;
  packedQuantity: number;
  product?: Product;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  sourceLocationId: string;
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
  pickStatus: 'Pending' | 'Picked';
  packStatus: 'Pending' | 'Packed';
  notes?: string;
  validatedAt?: string;
  createdAt: string;
  sourceLocation?: Location;
  items?: DeliveryItem[];
  createdByUser?: { id: string; name: string };
}

export interface TransferItem {
  id?: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface InternalTransfer {
  id: string;
  transferNumber: string;
  sourceLocationId: string;
  destinationLocationId: string;
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
  notes?: string;
  validatedAt?: string;
  createdAt: string;
  sourceLocation?: Location;
  destinationLocation?: Location;
  items?: TransferItem[];
  createdByUser?: { id: string; name: string };
}

export interface InventoryAdjustment {
  id: string;
  adjustmentNumber: string;
  productId: string;
  locationId: string;
  recordedQuantity: number;
  physicalCount: number;
  difference: number;
  reason?: string;
  status: string;
  validatedAt?: string;
  createdAt: string;
  product?: Product;
  location?: Location;
  createdByUser?: { id: string; name: string };
}

export interface StockLedgerEntry {
  id: string;
  movementType: 'RECEIPT' | 'DELIVERY' | 'INTERNAL_TRANSFER' | 'ADJUSTMENT' | 'INITIAL_STOCK';
  referenceDocument: string;
  productId: string;
  quantity: number;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  notes?: string;
  createdAt: string;
  product?: Product;
  fromLocation?: Location;
  toLocation?: Location;
  user?: { id: string; name: string; role: string };
}

export interface DashboardKPIs {
  totalProductsInStock: number;
  totalProductsCount: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalAlertsCount: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  internalTransfersScheduled: number;
}

export interface AlertItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minQuantity: number;
  targetQuantity: number;
}
