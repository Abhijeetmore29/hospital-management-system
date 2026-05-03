const API_URL = import.meta.env.VITE_API_URL || '/api';
const FILE_BASE_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL.replace(/\/api$/, '');

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

function publicRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers
  }).then(async (response) => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new Error(data?.message || 'Request failed');
    }

    return data;
  });
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  updateMe: (payload) => request('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  doctors: () => request('/users/doctors'),
  dashboardSummary: () => request('/dashboard/summary'),
  admittedPatients: () => request('/patients/admitted'),
  waitingOpdPatients: () => request('/patients/waiting-opd'),
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
  updateOperation: (id, payload) => request(`/operations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  medicalImages: (query = '') => request(`/medical-images${query}`),
  medicalImage: (id) => request(`/medical-images/${id}`),
  createMedicalImage: (payload) => request('/medical-images', { method: 'POST', body: JSON.stringify(payload) }),
  saveImagingReport: (id, payload) => request(`/medical-images/${id}/report`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMedicalImage: (id) => request(`/medical-images/${id}`, { method: 'DELETE' })
};

export function buildFileUrl(filePath) {
  if (!filePath) {
    return '';
  }

  if (/^https?:\/\//i.test(filePath) || filePath.startsWith('data:')) {
    return filePath;
  }

  return `${FILE_BASE_URL}${filePath}`;
}

export const publicApi = {
  medicalImagesAccess: (payload) => publicRequest(`/medical-images/public?patientId=${encodeURIComponent(payload.patientId)}&phone=${encodeURIComponent(payload.phone)}`)
};
