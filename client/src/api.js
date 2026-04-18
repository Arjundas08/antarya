const API_URL = '/api';

function getHeaders() {
  const token = localStorage.getItem('antarya_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

const api = {
  get: (path) => fetch(API_URL + path, { headers: getHeaders() }).then(handleResponse),

  post: (path, body) => fetch(API_URL + path, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  put: (path, body) => fetch(API_URL + path, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(handleResponse),

  delete: (path) => fetch(API_URL + path, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  // Auth shortcuts
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  completeSetup: () => api.put('/auth/setup-complete', {}),

  // Products
  getProducts: () => api.get('/products'),
  addProduct: (data) => api.post('/products', data),
  addProductsBulk: (products) => api.post('/products/bulk', { products }),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  addStock: (id, data) => api.put(`/products/${id}/add-stock`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Sales
  recordSale: (data) => api.post('/sales', data),
  getSales: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/sales${query ? '?' + query : ''}`);
  },
  getTodaySales: () => api.get('/sales/today'),
  getSalesSummary: () => api.get('/sales/summary'),

  // Customers
  getCustomers: () => api.get('/customers'),
  addCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  payCredit: (id, amount) => api.put(`/customers/${id}/pay-credit`, { amount }),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),

  // Dashboard
  getDashboard: () => api.get('/dashboard'),
  getSuggestions: () => api.get('/dashboard/suggestions'),
  addExpense: (data) => api.post('/dashboard/expense', data),
  getExpenses: () => api.get('/dashboard/expenses'),
  deleteExpense: (id) => api.delete(`/dashboard/expense/${id}`),

  // AI (Gemini + Bhashini)
  aiChat: (message, history) => api.post('/ai/chat', { message, history }),
  extractBill: (imageBase64) => api.post('/ai/extract-bill', { imageBase64 }),
  speechToText: (audioBase64, language) => api.post('/ai/speech-to-text', { audioBase64, language }),
  translate: (text, sourceLang, targetLang) => api.post('/ai/translate', { text, sourceLang, targetLang }),
  getAIStatus: () => api.get('/ai/status'),
};

export default api;
