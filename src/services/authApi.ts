import type {ApiEnvelope} from '../types/api';
import type {AuthResponse, RegisterPayload, RegistrationResponse, UserSession} from '../types/auth';
import {apiClient, dataOf} from './http';
type TokenDelivery = {accepted: boolean; developmentToken?: string};

export const authApi = {
  async login(email: string, password: string) { return dataOf(await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/login', {email, password})); },
  async register(payload: RegisterPayload) { return dataOf(await apiClient.post<ApiEnvelope<RegistrationResponse>>('/auth/register', payload)); },
  async currentUser() { return dataOf(await apiClient.get<ApiEnvelope<UserSession>>('/auth/me')); },
  async logout(refreshToken: string) { await apiClient.post('/auth/logout', {refreshToken}); },
  async forgotPassword(email: string) { return dataOf(await apiClient.post<ApiEnvelope<TokenDelivery>>('/auth/forgot-password', {email})); },
  async resetPassword(token: string, newPassword: string, confirmPassword: string) { await apiClient.post('/auth/reset-password', {token, newPassword, confirmPassword}); },
  async verifyEmail(token: string) { await apiClient.post('/auth/verify-email', {token}); },
  async resendVerification(email: string) { return dataOf(await apiClient.post<ApiEnvelope<TokenDelivery>>('/auth/resend-verification', {email})); },
};
