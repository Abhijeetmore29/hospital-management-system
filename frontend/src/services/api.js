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
  doctors: () => request('/doctors'),
  dashboardSummary: () => request('/dashboard/summary'),
  admittedPatients: () => request('/patients/admitted'),
  waitingOpdPatients: () => request('/opd-queue'),
  opdQueue: () => request('/opd-queue'),
  pricingMine: () => request('/pricing/mine'),
  pricingAll: () => request('/pricing'),
  savePricingMine: (payload) => request('/pricing/mine', { method: 'POST', body: JSON.stringify(payload) }),
  patients: (search = '') => request(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  patient: (id) => request(`/patients/${id}`),
  createPatient: (payload) => request('/patients', { method: 'POST', body: JSON.stringify(payload) }),
  updatePatient: (id, payload) => request(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  patientHistory: (id) => request(`/patients/${id}/history`),
  updatePrescription: (id, payload) => request(`/patients/${id}/prescription`, { method: 'POST', body: JSON.stringify(payload) }),
  dischargePatient: (id, payload) => request(`/patients/${id}/discharge`, { method: 'POST', body: JSON.stringify(payload) }),
  appointments: (query = '') => request(query && query.startsWith('?') ? `/appointments${query}` : `/appointments${query ? `?date=${encodeURIComponent(query)}` : ''}`),
  todayAppointments: () => request('/appointments/today'),
  createAppointment: (payload) => request('/appointments', { method: 'POST', body: JSON.stringify(payload) }),
  updateAppointment: (id, payload) => request(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  reassignAppointment: (id, payload) => request(`/appointments/${id}/reassign`, { method: 'PATCH', body: JSON.stringify(payload) }),
  consultation: (id) => request(`/consultations/${id}`),
  saveConsultation: (id, payload) => request(`/consultations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  prescriptionByAppointment: (id) => request(`/prescriptions/${id}/print`),
  payments: (query = '') => request(`/payments${query}`),
  paymentSummary: () => request('/payments/summary'),
  createPayment: (payload) => request('/payments', { method: 'POST', body: JSON.stringify(payload) }),
  billings: () => request('/billing'),
  billing: (id) => request(`/billing/${id}`),
  createBilling: (payload) => request('/billing', { method: 'POST', body: JSON.stringify(payload) }),
  updateBilling: (id, payload) => request(`/billing/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  markBillingPaid: (id) => request(`/billing/${id}/paid`, { method: 'PATCH' }),
  paymentSettings: (doctorId = '') => request(`/payment-settings${doctorId ? `?doctorId=${encodeURIComponent(doctorId)}` : ''}`),
  savePaymentSettings: (payload) => request('/payment-settings', { method: 'POST', body: JSON.stringify(payload) }),
  operations: (query = '') => request(`/operations${query}`),
  operation: (id) => request(`/operations/${id}`),
  createOperation: (payload) => request('/operations', { method: 'POST', body: JSON.stringify(payload) }),
  updateOperation: (id, payload) => request(`/operations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  medicalImages: (query = '') => request(`/medical-images${query}`),
  medicalImage: (id) => request(`/medical-images/${id}`),
  createMedicalImage: (payload) => request('/medical-images', { method: 'POST', body: JSON.stringify(payload) }),
  saveImagingReport: (id, payload) => request(`/medical-images/${id}/report`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMedicalImage: (id) => request(`/medical-images/${id}`, { method: 'DELETE' }),
  adminStaff: () => request('/admin/staff'),
  createAdminStaff: (payload) => request('/admin/staff', { method: 'POST', body: JSON.stringify(payload) }),
  updateAdminStaff: (id, payload) => request(`/admin/staff/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updateAdminStaffPermissions: (id, payload) => request(`/admin/staff/${id}/permissions`, { method: 'PATCH', body: JSON.stringify(payload) }),
  resetAdminStaffPassword: (id, payload) => request(`/admin/staff/${id}/reset-password`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteAdminStaff: (id) => request(`/admin/staff/${id}`, { method: 'DELETE' })
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
  medicalImagesAccess: (payload) => publicRequest(`/medical-images/public?patientId=${encodeURIComponent(payload.patientId)}&phone=${encodeURIComponent(payload.phone)}`),
  doctors: () => publicRequest('/doctors'),
  createAppointment: (payload) => publicRequest('/appointments/public', { method: 'POST', body: JSON.stringify(payload) }),
  appointment: (id) => publicRequest(`/appointments/public/${encodeURIComponent(id)}`)
};
