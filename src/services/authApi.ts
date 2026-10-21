import type {AuthResponse, UserSession} from '../types/auth';
import {apiClient} from './http';

type LoginRequest = {email: string; password: string};
type RegisterRequest = LoginRequest & {name: string};

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },
  async currentUser(): Promise<UserSession> {
    const response = await apiClient.get<UserSession>('/profile/me');
    return response.data;
  },
};
