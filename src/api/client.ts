import axios, { AxiosError } from 'axios';

// IMPORTANTE: baseURL NO debe incluir /api
// TODOS los endpoints incluyen el prefijo /api/ según OpenAPI
// Ejemplo: /api/auth/login, /api/users, /api/invoices, /api/clients, /api/companies
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Cliente Axios configurado
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función helper para decodificar JWT sin verificar firma
const decodeJWT = (token: string): { exp: number } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Función para verificar si el token está expirado
const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  // Verificar si expira en los próximos 30 segundos
  const expirationTime = decoded.exp * 1000; // Convertir a ms
  const currentTime = Date.now();
  const bufferTime = 30 * 1000; // 30 segundos de buffer

  return currentTime >= (expirationTime - bufferTime);
};

// Interceptor: Agregar JWT token automáticamente y validar expiración
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar si el token está expirado ANTES de enviar la petición
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Convierte arrays de fecha del backend ([2025, 11, 20, ...]) a strings ISO-8601
 * Java serializa LocalDateTime como arrays cuando no está bien configurado
 */
const parseDateArrays = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) return obj;

  // Si es un array de números con 6-7 elementos, es una fecha
  if (Array.isArray(obj) && obj.length >= 6 && obj.length <= 7 && obj.every(n => typeof n === 'number')) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = obj;
    // Crear fecha ISO-8601 (month en JavaScript es 0-indexed, pero en el array del backend es 1-indexed)
    const date = new Date(year, month - 1, day, hour, minute, second);
    return date.toISOString();
  }

  // Si es un array, recursivamente parsear cada elemento
  if (Array.isArray(obj)) {
    return obj.map(parseDateArrays);
  }

  // Si es un objeto, recursivamente parsear cada propiedad
  if (typeof obj === 'object') {
    const parsed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      parsed[key] = parseDateArrays(value);
    }
    return parsed;
  }

  return obj;
};

// Interceptor: Parsear fechas y manejar errores globales
apiClient.interceptors.response.use(
  (response) => {
    // Parsear fechas automáticamente (excepto para blobs/archivos)
    if (response.data && response.config.responseType !== 'blob') {
      response.data = parseDateArrays(response.data);
    }
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar estado y redirigir
      const errorMessage = error.response.data?.message || '';

      // Limpiar autenticación
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Limpiar Zustand store si está disponible
      if (typeof window !== 'undefined') {
        // Disparar evento personalizado para que el store reaccione
        window.dispatchEvent(new CustomEvent('auth:logout', {
          detail: { reason: errorMessage }
        }));
      }

      // Redirigir a login solo si no estamos ya allí
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper para manejar errores
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return 'Error desconocido';
};
