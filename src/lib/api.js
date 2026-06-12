// ============================================================
// API Helper - Centralized API calls
// ============================================================
// All backend API calls go through this file.
// In development, Vite proxies /api to localhost:3000.
// In production, we use the full backend URL.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}/api${endpoint}`;
  
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.details || `HTTP ${response.status}`);
  }

  return response.json();
}

// ----- Customer APIs -----
export const customerApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/customers?${query}`);
  },
  get: (id) => request(`/customers/${id}`),
  create: (data) => request('/customers', { method: 'POST', body: data }),
  bulkImport: (customers) => request('/customers/bulk', { method: 'POST', body: { customers } }),
};

// ----- Order APIs -----
export const orderApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders?${query}`);
  },
  create: (data) => request('/orders', { method: 'POST', body: data }),
};

// ----- Segment APIs -----
export const segmentApi = {
  list: () => request('/segments'),
  get: (id) => request(`/segments/${id}`),
  create: (data) => request('/segments', { method: 'POST', body: data }),
  preview: (filter_query) => request('/segments/preview', { method: 'POST', body: { filter_query } }),
  delete: (id) => request(`/segments/${id}`, { method: 'DELETE' }),
};

// ----- Campaign APIs -----
export const campaignApi = {
  list: () => request('/campaigns'),
  get: (id) => request(`/campaigns/${id}`),
  create: (data) => request('/campaigns', { method: 'POST', body: data }),
  send: (id) => request(`/campaigns/${id}/send`, { method: 'POST' }),
  logs: (id) => request(`/campaigns/${id}/logs`),
};

// ----- Analytics APIs -----
export const analyticsApi = {
  overview: () => request('/analytics/overview'),
  campaigns: () => request('/analytics/campaigns'),
  channels: () => request('/analytics/channels'),
};

// ----- AI APIs -----
export const aiApi = {
  segment: (query) => request('/ai/segment', { method: 'POST', body: { query } }),
  message: (data) => request('/ai/message', { method: 'POST', body: data }),
  suggest: () => request('/ai/suggest', { method: 'POST' }),
};
