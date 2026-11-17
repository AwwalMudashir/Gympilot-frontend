import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { environment } from '../config/environment';
import type { ApiEnvelope } from '../types/api';
import type { AuthResponse } from '../types/auth';
import { tokenVault } from './tokenVault';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };
export const apiClient = axios.create({
  baseURL: environment.apiBaseUrl,
  // Render Free services can need about a minute to wake from an idle state.
  timeout: 120_000,
});
export const visionClient = axios.create({
  baseURL: environment.visionBaseUrl,
  timeout: 120_000,
});

apiClient.interceptors.request.use(config => {
  const token = tokenVault.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshInFlight: Promise<string> | null = null;
let sessionExpiredHandler: (() => void) | undefined;

export function setSessionExpiredHandler(handler: () => void) {
  sessionExpiredHandler = handler;
}

async function refreshAccessToken() {
  const refreshToken = tokenVault.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token is available');
  const response = await axios.post<ApiEnvelope<AuthResponse>>(
    `${environment.apiBaseUrl}/auth/refresh`,
    { refreshToken },
  );
  const refreshed = response.data.data;
  await tokenVault.write({
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
  });
  return refreshed.accessToken;
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const authRoute =
      config?.url?.includes('/auth/login') ||
      config?.url?.includes('/auth/refresh');
    if (error.response?.status !== 401 || !config || config._retry || authRoute)
      throw error;
    config._retry = true;
    try {
      refreshInFlight ??= refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
      config.headers.Authorization = `Bearer ${await refreshInFlight}`;
      return apiClient(config);
    } catch (refreshError) {
      await tokenVault.clear();
      sessionExpiredHandler?.();
      throw refreshError;
    }
  },
);

export function dataOf<T>(response: { data: ApiEnvelope<T> }) {
  return response.data.data;
}
export function apiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  if (!axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'The GymBro server is taking longer than expected to wake up. Wait a moment and try again.';
  }
  if (!error.response) {
    return 'Cannot reach the GymBro server. Check your internet connection and try again.';
  }
  if ([502, 503, 504].includes(error.response.status)) {
    return 'The GymBro server is waking up. Wait about a minute and try again.';
  }
  const firstError = error.response?.data?.errors?.[0];
  if (firstError?.message === 'must not be null' && firstError.field) {
    const field = firstError.field
      .replace(/^results\[\d+\]\./, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase();
    return `The ${field} is required. Refresh the workout and try again.`;
  }

  return firstError?.message || error.response?.data?.message || fallback;
}

export function apiErrorCode(error: unknown) {
  if (!axios.isAxiosError<ApiEnvelope<unknown>>(error)) return undefined;
  return error.response?.data?.errors?.[0]?.code;
}
