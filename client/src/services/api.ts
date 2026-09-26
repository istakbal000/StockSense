const BASE_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('stocksense_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('stocksense_token', token);
  } else {
    localStorage.removeItem('stocksense_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  signup: (body: any) => request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (email: string) => request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: (email: string, otp: string) => request<any>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resetPassword: (body: any) => request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (body: any) => request<any>('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),

  // Warehouses & Locations
  getWarehouses: () => request<any>('/warehouses'),
  createWarehouse: (body: any) => request<any>('/warehouses', { method: 'POST', body: JSON.stringify(body) }),
  getLocations: (warehouseId?: string) => request<any>(`/warehouses/locations${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  createLocation: (body: any) => request<any>('/warehouses/locations', { method: 'POST', body: JSON.stringify(body) }),

  // Products
  getProducts: (params?: { search?: string; categoryId?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.categoryId) q.append('categoryId', params.categoryId);
    return request<any>(`/products?${q.toString()}`);
  },
  getProductById: (id: string) => request<any>(`/products/${id}`),
  createProduct: (body: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getCategories: () => request<any>('/products/categories'),
  createCategory: (body: any) => request<any>('/products/categories', { method: 'POST', body: JSON.stringify(body) }),
  getUnits: () => request<any>('/products/units'),
  createUnit: (body: any) => request<any>('/products/units', { method: 'POST', body: JSON.stringify(body) }),
  saveReorderRule: (productId: string, body: any) => request<any>(`/products/${productId}/reordering-rules`, { method: 'POST', body: JSON.stringify(body) }),

  // Receipts
  getReceipts: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request<any>(`/receipts?${q.toString()}`);
  },
  getReceiptById: (id: string) => request<any>(`/receipts/${id}`),
  createReceipt: (body: any) => request<any>('/receipts', { method: 'POST', body: JSON.stringify(body) }),
  validateReceipt: (id: string) => request<any>(`/receipts/${id}/validate`, { method: 'POST' }),
  cancelReceipt: (id: string) => request<any>(`/receipts/${id}/cancel`, { method: 'POST' }),

  // Deliveries
  getDeliveries: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request<any>(`/deliveries?${q.toString()}`);
  },
  getDeliveryById: (id: string) => request<any>(`/deliveries/${id}`),
  createDelivery: (body: any) => request<any>('/deliveries', { method: 'POST', body: JSON.stringify(body) }),
  pickDelivery: (id: string) => request<any>(`/deliveries/${id}/pick`, { method: 'POST' }),
  packDelivery: (id: string) => request<any>(`/deliveries/${id}/pack`, { method: 'POST' }),
  validateDelivery: (id: string) => request<any>(`/deliveries/${id}/validate`, { method: 'POST' }),
  cancelDelivery: (id: string) => request<any>(`/deliveries/${id}/cancel`, { method: 'POST' }),

  // Transfers
  getTransfers: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request<any>(`/transfers?${q.toString()}`);
  },
  getTransferById: (id: string) => request<any>(`/transfers/${id}`),
  createTransfer: (body: any) => request<any>('/transfers', { method: 'POST', body: JSON.stringify(body) }),
  validateTransfer: (id: string) => request<any>(`/transfers/${id}/validate`, { method: 'POST' }),
  cancelTransfer: (id: string) => request<any>(`/transfers/${id}/cancel`, { method: 'POST' }),

  // Adjustments
  getAdjustments: (params?: { productId?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.productId) q.append('productId', params.productId);
    if (params?.search) q.append('search', params.search);
    return request<any>(`/adjustments?${q.toString()}`);
  },
  getAdjustmentPreview: (productId: string, locationId: string) =>
    request<any>(`/adjustments/preview?productId=${productId}&locationId=${locationId}`),
  applyAdjustment: (body: any) => request<any>('/adjustments', { method: 'POST', body: JSON.stringify(body) }),

  // Dashboard
  getDashboardSummary: () => request<any>('/dashboard/summary'),
  getDashboardOperations: (params?: any) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'all') q.append(k, String(v));
      });
    }
    return request<any>(`/dashboard/operations?${q.toString()}`);
  },

  // Stock Ledger / Move History
  getMoveHistory: (params?: { movementType?: string; search?: string; productId?: string; locationId?: string }) => {
    const q = new URLSearchParams();
    if (params?.movementType && params.movementType !== 'all') q.append('movementType', params.movementType);
    if (params?.search) q.append('search', params.search);
    if (params?.productId) q.append('productId', params.productId);
    if (params?.locationId) q.append('locationId', params.locationId);
    return request<any>(`/ledger?${q.toString()}`);
  },
};
