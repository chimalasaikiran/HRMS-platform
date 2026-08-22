// API service configuration and client with failover support

const API_ENDPOINTS = [
  import.meta.env.VITE_API_URL_PRIMARY || 'https://hrms-platform-monh.onrender.com/api',
  import.meta.env.VITE_API_URL_SECONDARY || 'https://hrms-platform-monh.onrender.com/'
];

let workingBaseUrl = null;

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
    ...(options.headers || {})
  };

  // List of endpoints to try: working endpoint first, then remaining endpoints
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
        6000
      );

      // If we got a network response (even HTTP 4xx or 5xx), the server is reachable!
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
        const err = new Error(responseData.message || responseData.error || `HTTP ${response.status}: Request failed`);
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
      // If it's an HTTP response error thrown above, don't failover to next IP unless it's 502/503/504
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

/**
 * Test server connectivity
 */
export async function checkServerStatus() {
  for (const url of API_ENDPOINTS) {
    const cleanBaseUrl = url.replace(/\/$/, '');
    try {
      const res = await fetchWithTimeout(`${cleanBaseUrl}/health`, { method: 'GET' }, 3000)
        .catch(() => fetchWithTimeout(`${cleanBaseUrl}`, { method: 'GET' }, 3000));
      if (res) {
        workingBaseUrl = url;
        return { online: true, activeUrl: cleanBaseUrl };
      }
    } catch (e) {
      // continue to next URL
    }
  }
  return { online: false, activeUrl: API_ENDPOINTS[0] };
}

/**
 * Authentication API methods
 */
export const authApi = {
  login: async (payload) => {
    // Send form data (email, password, role) to backend API
    try {
      return await sendApiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      // Try alternate endpoint /auth/login if /login returns 404
      if (err.status === 404) {
        return await sendApiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      throw err;
    }
  },

  signup: async (payload) => {
    // Send all filled form fields (employeeId, email, password, fullName, role)
    try {
      return await sendApiRequest('/signup', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      if (err.status === 404) {
        try {
          return await sendApiRequest('/register', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        } catch (err2) {
          if (err2.status === 404) {
            return await sendApiRequest('/auth/register', {
              method: 'POST',
              body: JSON.stringify(payload)
            });
          }
          throw err2;
        }
      }
      throw err;
    }
  }
};

export const getActiveBaseUrl = () => workingBaseUrl || API_ENDPOINTS[0];
export const getConfiguredEndpoints = () => API_ENDPOINTS;
