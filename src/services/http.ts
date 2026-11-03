import axios, {AxiosError, type InternalAxiosRequestConfig} from 'axios';

import {environment} from '../config/environment';
import type {ApiEnvelope} from '../types/api';
import type {AuthResponse} from '../types/auth';
import {tokenVault} from './tokenVault';

type RetryConfig = InternalAxiosRequestConfig & {_retry?: boolean};
export const apiClient = axios.create({baseURL: environment.apiBaseUrl, timeout: 15_000});
export const visionClient = axios.create({baseURL: environment.visionBaseUrl, timeout: 10_000});

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
  const response = await axios.post<ApiEnvelope<AuthResponse>>(`${environment.apiBaseUrl}/auth/refresh`, {refreshToken});
  const refreshed = response.data.data;
  await tokenVault.write({accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken});
  return refreshed.accessToken;
}

apiClient.interceptors.response.use(response => response, async (error: AxiosError) => {
  const config = error.config as RetryConfig | undefined;
  const authRoute = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/refresh');
  if (error.response?.status !== 401 || !config || config._retry || authRoute) throw error;
  config._retry = true;
  try {
    refreshInFlight ??= refreshAccessToken().finally(() => { refreshInFlight = null; });
    config.headers.Authorization = `Bearer ${await refreshInFlight}`;
    return apiClient(config);
  } catch (refreshError) {
    await tokenVault.clear();
    sessionExpiredHandler?.();
    throw refreshError;
  }
});

export function dataOf<T>(response: {data: ApiEnvelope<T>}) { return response.data.data; }
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (!axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
  return error.response?.data?.errors?.[0]?.message || error.response?.data?.message || fallback;
}
