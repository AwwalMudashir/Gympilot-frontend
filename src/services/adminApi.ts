import type { ApiEnvelope } from '../types/api';
import type { AdminUser } from '../types/admin';
import { apiClient, dataOf } from './http';

export const adminApi = {
  async listUsers() {
    return dataOf(
      await apiClient.get<ApiEnvelope<AdminUser[]>>('/admin/users'),
    );
  },

  async deactivateUser(userId: string) {
    return dataOf(
      await apiClient.patch<ApiEnvelope<AdminUser>>(
        `/admin/users/${userId}/deactivate`,
      ),
    );
  },

  async reactivateUser(userId: string) {
    return dataOf(
      await apiClient.patch<ApiEnvelope<AdminUser>>(
        `/admin/users/${userId}/reactivate`,
      ),
    );
  },

  async permanentlyDeleteUser(userId: string, confirmEmail: string) {
    await apiClient.delete(`/admin/users/${userId}`, {
      params: { confirmEmail },
    });
  },
};
