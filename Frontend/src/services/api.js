// API client with auth header, Render-friendly timeouts, and clear errors

const API_ENDPOINTS = [
  (import.meta.env.VITE_API_URL_PRIMARY || 'https://hrms-platform-monh.onrender.com/api').replace(
    /\/$/,
    ''
  ),
  (import.meta.env.VITE_API_URL_SECONDARY || 'https://hrms-platform-monh.onrender.com/api').replace(
    /\/$/,
    ''
  ),
].filter((url, i, arr) => arr.indexOf(url) === i);

let workingBaseUrl = null;

function extractErrorMessage(responseData, status) {
  if (!responseData) return `HTTP ${status}: Request failed`;
  if (typeof responseData.message === 'string' && responseData.message) {
    return responseData.message;
  }
  if (typeof responseData.error === 'string') return responseData.error;
  if (responseData.error && typeof responseData.error.message === 'string') {
    return responseData.error.message;
  }
  return `HTTP ${status}: Request failed`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function sendApiRequest(endpointPath, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (!headers.Authorization) {
    try {
      const session = JSON.parse(localStorage.getItem('dayflow_session') || 'null');
      if (session?.token) {
        headers.Authorization = `Bearer ${session.token}`;
      }
    } catch {
      // ignore bad session JSON
    }
  }

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
          headers,
        },
        options.timeoutMs || 20000
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
        const err = new Error(extractErrorMessage(responseData, response.status));
        err.status = response.status;
        err.data = responseData;
        throw err;
      }

      return {
        data: responseData,
        baseUrl: cleanBaseUrl,
        status: response.status,
      };
    } catch (err) {
      if (err.status && err.status < 500) {
        throw err;
      }
      console.warn(`[API] Failed connecting to ${fullUrl}:`, err.message || err);
      lastError = err;
    }
  }

  throw new Error(
    lastError?.message ||
      `Unable to connect to backend server at ${API_ENDPOINTS.join(' or ')}. Please check network connection.`
  );
}

export async function checkServerStatus() {
  for (const url of API_ENDPOINTS) {
    const cleanBaseUrl = url.replace(/\/$/, '');
    try {
      const res = await fetchWithTimeout(`${cleanBaseUrl}/health`, { method: 'GET' }, 8000);
      if (res && res.ok) {
        workingBaseUrl = url;
        return { online: true, activeUrl: cleanBaseUrl };
      }
    } catch {
      // continue
    }
  }
  return { online: false, activeUrl: API_ENDPOINTS[0] };
}

export const authApi = {
  login: async (payload) => {
    try {
      return await sendApiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        timeoutMs: 45000,
      });
    } catch (err) {
      if (err.status === 404) {
        return await sendApiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
          timeoutMs: 45000,
        });
      }
      throw err;
    }
  },

  signup: async (payload) => {
    try {
      return await sendApiRequest('/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
        timeoutMs: 45000,
      });
    } catch (err) {
      if (err.status === 404) {
        try {
          return await sendApiRequest('/register', {
            method: 'POST',
            body: JSON.stringify(payload),
            timeoutMs: 45000,
          });
        } catch (err2) {
          if (err2.status === 404) {
            return await sendApiRequest('/auth/register', {
              method: 'POST',
              body: JSON.stringify(payload),
              timeoutMs: 45000,
            });
          }
          throw err2;
        }
      }
      throw err;
    }
  },

  me: async () => sendApiRequest('/auth/me', { method: 'GET' }),
};

function mapLeaveType(type) {
  const t = String(type || 'Paid').trim().toUpperCase();
  if (t.startsWith('SICK')) return 'SICK';
  if (t.startsWith('UNPAID')) return 'UNPAID';
  return 'PAID';
}

function inclusiveDays(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.max(1, Math.floor((end - start) / 86400000) + 1);
}

export const hrmsApi = {
  listEmployees: () => sendApiRequest('/employees', { method: 'GET' }),
  getEmployee: (id) => sendApiRequest(`/employees/${id}`, { method: 'GET' }),
  patchEmployee: (id, body) =>
    sendApiRequest(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getSalary: (id) => sendApiRequest(`/employees/${id}/salary`, { method: 'GET' }),
  putSalary: (id, body) =>
    sendApiRequest(`/employees/${id}/salary`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  checkIn: () => sendApiRequest('/attendance/check-in', { method: 'POST', body: '{}' }),
  checkOut: () => sendApiRequest('/attendance/check-out', { method: 'POST', body: '{}' }),
  myAttendance: (month) =>
    sendApiRequest(`/attendance/me${month ? `?month=${encodeURIComponent(month)}` : ''}`, {
      method: 'GET',
    }),
  adminAttendance: (date) =>
    sendApiRequest(`/attendance${date ? `?date=${encodeURIComponent(date)}` : ''}`, {
      method: 'GET',
    }),

  myLeaves: () => sendApiRequest('/timeoff/me', { method: 'GET' }),
  allLeaves: (status) =>
    sendApiRequest(`/timeoff${status ? `?status=${encodeURIComponent(status)}` : ''}`, {
      method: 'GET',
    }),
  applyLeave: ({ type, startDate, endDate, days, reason }) =>
    sendApiRequest('/timeoff', {
      method: 'POST',
      body: JSON.stringify({
        type: mapLeaveType(type),
        startDate,
        endDate,
        days: days || inclusiveDays(startDate, endDate),
        reason: reason || '',
      }),
    }),
  approveLeave: (id, comment) =>
    sendApiRequest(`/timeoff/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ comment: comment || '' }),
    }),
  rejectLeave: (id, comment) =>
    sendApiRequest(`/timeoff/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ comment: comment || '' }),
    }),

  payrollMe: (month) =>
    sendApiRequest(`/payroll/me${month ? `?month=${encodeURIComponent(month)}` : ''}`, {
      method: 'GET',
    }),
};

export const getActiveBaseUrl = () => workingBaseUrl || API_ENDPOINTS[0];
export const getConfiguredEndpoints = () => API_ENDPOINTS;
