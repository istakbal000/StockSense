const BASE_URL = '/api';

export function getAuthToken() {
  return localStorage.getItem('stocksense_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('stocksense_token', token);
  } else {
    localStorage.removeItem('stocksense_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),

  // Warehouses & Locations
  getWarehouses: () => request('/warehouses'),
  createWarehouse: (body) => request('/warehouses', { method: 'POST', body: JSON.stringify(body) }),
  getLocations: (warehouseId) => request(`/warehouses/locations${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  createLocation: (body) => request('/warehouses/locations', { method: 'POST', body: JSON.stringify(body) }),

  // Products
  getProducts: (params) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.categoryId) q.append('categoryId', params.categoryId);
    return request(`/products?${q.toString()}`);
  },
  getProductById: (id) => request(`/products/${id}`),
  createProduct: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getCategories: () => request('/products/categories'),
  createCategory: (body) => request('/products/categories', { method: 'POST', body: JSON.stringify(body) }),
  getUnits: () => request('/products/units'),
  createUnit: (body) => request('/products/units', { method: 'POST', body: JSON.stringify(body) }),
  saveReorderRule: (productId, body) => request(`/products/${productId}/reordering-rules`, { method: 'POST', body: JSON.stringify(body) }),

  // Receipts
  getReceipts: (params) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request(`/receipts?${q.toString()}`);
  },
  getReceiptById: (id) => request(`/receipts/${id}`),
  createReceipt: (body) => request('/receipts', { method: 'POST', body: JSON.stringify(body) }),
  validateReceipt: (id) => request(`/receipts/${id}/validate`, { method: 'POST' }),
  cancelReceipt: (id) => request(`/receipts/${id}/cancel`, { method: 'POST' }),

  // Deliveries
  getDeliveries: (params) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request(`/deliveries?${q.toString()}`);
  },
  getDeliveryById: (id) => request(`/deliveries/${id}`),
  createDelivery: (body) => request('/deliveries', { method: 'POST', body: JSON.stringify(body) }),
  pickDelivery: (id) => request(`/deliveries/${id}/pick`, { method: 'POST' }),
  packDelivery: (id) => request(`/deliveries/${id}/pack`, { method: 'POST' }),
  validateDelivery: (id) => request(`/deliveries/${id}/validate`, { method: 'POST' }),
  cancelDelivery: (id) => request(`/deliveries/${id}/cancel`, { method: 'POST' }),

  // Transfers
  getTransfers: (params) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request(`/transfers?${q.toString()}`);
  },
  getTransferById: (id) => request(`/transfers/${id}`),
  createTransfer: (body) => request('/transfers', { method: 'POST', body: JSON.stringify(body) }),
  validateTransfer: (id) => request(`/transfers/${id}/validate`, { method: 'POST' }),
  cancelTransfer: (id) => request(`/transfers/${id}/cancel`, { method: 'POST' }),

  // Adjustments
  getAdjustments: (params) => {
    const q = new URLSearchParams();
    if (params?.productId) q.append('productId', params.productId);
    if (params?.search) q.append('search', params.search);
    return request(`/adjustments?${q.toString()}`);
  },
  getAdjustmentPreview: (productId, locationId) =>
  request(`/adjustments/preview?productId=${productId}&locationId=${locationId}`),
  applyAdjustment: (body) => request('/adjustments', { method: 'POST', body: JSON.stringify(body) }),

  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),
  getDashboardOperations: (params) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'all') q.append(k, String(v));
      });
    }
    return request(`/dashboard/operations?${q.toString()}`);
  },

  // Stock Ledger / Move History
  getMoveHistory: (params) => {
    const q = new URLSearchParams();
    if (params?.movementType && params.movementType !== 'all') q.append('movementType', params.movementType);
    if (params?.search) q.append('search', params.search);
    if (params?.productId) q.append('productId', params.productId);
    if (params?.locationId) q.append('locationId', params.locationId);
    return request(`/ledger?${q.toString()}`);
  }
};