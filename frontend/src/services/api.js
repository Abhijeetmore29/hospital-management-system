const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('hms_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  doctors: () => request('/users/doctors'),
  dashboardSummary: () => request('/dashboard/summary'),
  admittedPatients: () => request('/patients/admitted'),
  pricingMine: () => request('/pricing/mine'),
  pricingAll: () => request('/pricing'),
  savePricingMine: (payload) => request('/pricing/mine', { method: 'POST', body: JSON.stringify(payload) }),
  patients: (search = '') => request(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  patient: (id) => request(`/patients/${id}`),
  createPatient: (payload) => request('/patients', { method: 'POST', body: JSON.stringify(payload) }),
  updatePatient: (id, payload) => request(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updatePrescription: (id, payload) => request(`/patients/${id}/prescription`, { method: 'POST', body: JSON.stringify(payload) }),
  dischargePatient: (id, payload) => request(`/patients/${id}/discharge`, { method: 'POST', body: JSON.stringify(payload) }),
  appointments: (date = '') => request(`/appointments${date ? `?date=${encodeURIComponent(date)}` : ''}`),
  todayAppointments: () => request('/appointments/today'),
  createAppointment: (payload) => request('/appointments', { method: 'POST', body: JSON.stringify(payload) }),
  updateAppointment: (id, payload) => request(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  payments: (query = '') => request(`/payments${query}`),
  paymentSummary: () => request('/payments/summary'),
  createPayment: (payload) => request('/payments', { method: 'POST', body: JSON.stringify(payload) }),
  operations: (query = '') => request(`/operations${query}`),
  operation: (id) => request(`/operations/${id}`),
  createOperation: (payload) => request('/operations', { method: 'POST', body: JSON.stringify(payload) }),
  updateOperation: (id, payload) => request(`/operations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
};
