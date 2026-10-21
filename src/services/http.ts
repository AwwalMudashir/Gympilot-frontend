import axios from 'axios';

import {environment} from '../config/environment';
import {tokenVault} from './tokenVault';

export const apiClient = axios.create({baseURL: environment.apiBaseUrl, timeout: 10_000});
export const visionClient = axios.create({baseURL: environment.visionBaseUrl, timeout: 10_000});

apiClient.interceptors.request.use(config => {
  const token = tokenVault.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
