import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

let isRefreshing = false;
let failedQueue: any[] = [];
interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

export const getApiBaseURL = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const trimmed = raw.replace(/\/+$/, '');
  // Normalize common misconfig: setting API url to ".../api" or ".../api/v1"
  if (trimmed.endsWith('/api/v1')) return trimmed.slice(0, -('/api/v1'.length));
  if (trimmed.endsWith('/api')) return trimmed.slice(0, -('/api'.length));
  return trimmed;
};

/** Fetch CSRF cookie from Laravel Sanctum (required before POST/PUT/PATCH/DELETE when using stateful API). */
export async function getCsrfCookie(): Promise<void> {
  const baseURL = getApiBaseURL();
  await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
}

const api: AxiosInstance = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && config.headers) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const guestCartToken = localStorage.getItem('guest_cart_token');
        if (guestCartToken) {
          config.headers['X-Guest-Cart-Token'] = guestCartToken;
        }
      }
    }
    // FormData must be sent with boundary; browser sets Content-Type when we omit it
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const guestCartToken = response.headers?.['x-guest-cart-token'];
    if (typeof window !== 'undefined' && guestCartToken) {
      localStorage.setItem('guest_cart_token', guestCartToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          try {
            // Try to refresh the token (use api so credentials + CSRF are sent)
            const response = await api.post('/api/v1/auth/refresh', {
              refresh: refreshToken,
            });

            if (response.data.access) {
              localStorage.setItem('access_token', response.data.access);
              if (response.data.refresh) {
                localStorage.setItem('refresh_token', response.data.refresh);
              }
              processQueue(null, response.data.access);
              isRefreshing = false;
              // Retry the original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
              }
              return api(originalRequest);
            }
          } catch (refreshError) {
            isRefreshing = false;
            // Refresh failed, logout user and redirect (they were logged in)
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token = guest. Do NOT redirect; let protected pages handle it.
          // Otherwise public pages (e.g. /products) that call optional-auth APIs (e.g. wishlist) would send guests to login.
          isRefreshing = false;
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          processQueue(error);
          return Promise.reject(error);
        }
      }
      isRefreshing = false;
      processQueue(error);
      return Promise.reject(error);
    }

    // Handle 419 CSRF token mismatch — fetch cookie then retry once
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await getCsrfCookie();
        return api(originalRequest);
      } catch (csrfErr) {
        return Promise.reject(csrfErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
