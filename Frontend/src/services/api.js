// API service configuration and client with failover support

const API_ENDPOINTS = [
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  import.meta.env.VITE_API_URL_PRIMARY || 'https://hrms-platform-monh.onrender.com/api',
  import.meta.env.VITE_API_URL_SECONDARY || 'https://hrms-platform-monh.onrender.com/'
];

let workingBaseUrl = null;

function getAuthHeader() {
  const session = localStorage.getItem('dayflow_session');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      if (parsed?.token) {
        return { Authorization: `Bearer ${parsed.token}` };
      }
    } catch (e) {
      // ignore
    }
  }
  return {};
}

/**
 * Helper to fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Execute request across primary and secondary API endpoints if connection fails
 */
export async function sendApiRequest(endpointPath, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const endpointsToTry = workingBaseUrl
    ? [workingBaseUrl, ...API_ENDPOINTS.filter((url) => url !== workingBaseUrl)]
    : API_ENDPOINTS;

  let lastError = null;

  for (const baseUrl of endpointsToTry) {
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
    const fullUrl = `${cleanBaseUrl}${cleanPath}`;

    try {
      const response = await fetchWithTimeout(
        fullUrl,
        {
          ...options,
          headers
        },
        5000
      );

      workingBaseUrl = baseUrl;

      let responseData = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = { message: text };
      }

      if (!response.ok) {
        const errMessage = responseData?.error?.message || responseData?.message || `HTTP ${response.status}`;
        const err = new Error(errMessage);
        err.status = response.status;
        err.data = responseData;
        throw err;
      }

      return {
        data: responseData,
        baseUrl: cleanBaseUrl,
        status: response.status
      };
    } catch (err) {
      if (err.status && err.status < 500) {
        throw err;
      }
      lastError = err;
    }
  }

  throw new Error(
    lastError?.message || `Unable to connect to server at ${API_ENDPOINTS[0]}`
  );
}

export async function checkServerStatus() {
  for (const url of API_ENDPOINTS) {
    const cleanBaseUrl = url.replace(/\/$/, '');
    try {
      const res = await fetchWithTimeout(`${cleanBaseUrl}/health`, { method: 'GET' }, 2000);
      if (res.ok) {
        workingBaseUrl = url;
        return { online: true, activeUrl: cleanBaseUrl };
      }
    } catch (e) {}
  }
  return { online: false, activeUrl: API_ENDPOINTS[0] };
}

export const authApi = {
  login: (payload) =>
    sendApiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  registerCompany: (payload) =>
    sendApiRequest('/auth/register-company', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  changePassword: (payload) =>
    sendApiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getMe: () => sendApiRequest('/auth/me', { method: 'GET' })
};

export const employeesApi = {
  getAll: (search = '') =>
    sendApiRequest(`/employees${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
      method: 'GET'
    }),
  create: (payload) =>
    sendApiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getById: (id) => sendApiRequest(`/employees/${id}`, { method: 'GET' }),
  update: (id, payload) =>
    sendApiRequest(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  getSalary: (id) => sendApiRequest(`/employees/${id}/salary`, { method: 'GET' }),
  updateSalary: (id, payload) =>
    sendApiRequest(`/employees/${id}/salary`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
};

export const attendanceApi = {
  checkIn: () => sendApiRequest('/attendance/check-in', { method: 'POST' }),
  checkOut: () => sendApiRequest('/attendance/check-out', { method: 'POST' }),
  getMine: (month) =>
    sendApiRequest(`/attendance/me${month ? `?month=${month}` : ''}`, { method: 'GET' }),
  getMySummary: (month) =>
    sendApiRequest(`/attendance/me/summary${month ? `?month=${month}` : ''}`, { method: 'GET' }),
  getAdminDayView: (date) =>
    sendApiRequest(`/attendance${date ? `?date=${date}` : ''}`, { method: 'GET' })
};

export const timeoffApi = {
  getAllocations: () => sendApiRequest('/timeoff/allocations/me', { method: 'GET' }),
  getMine: () => sendApiRequest('/timeoff/me', { method: 'GET' }),
  getAdminList: (status = 'PENDING') =>
    sendApiRequest(`/timeoff?status=${status}`, { method: 'GET' }),
  create: (payload) =>
    sendApiRequest('/timeoff', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  approve: (id, comment) =>
    sendApiRequest(`/timeoff/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ comment })
    }),
  reject: (id, comment) =>
    sendApiRequest(`/timeoff/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ comment })
    })
};

export const payrollApi = {
  getMine: () => sendApiRequest('/payroll/me', { method: 'GET' }),
  getEmployeePayroll: (id) => sendApiRequest(`/payroll/${id}`, { method: 'GET' })
};

export const getConfiguredEndpoints = () => API_ENDPOINTS;

export const getActiveBaseUrl = () => workingBaseUrl || API_ENDPOINTS[0];

export const aiApi = {
  chat: (messages) =>
    sendApiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages })
    }),
  query: (payload) =>
    sendApiRequest('/ai/query', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};

