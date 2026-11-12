export type AdminUserStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE';

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role: 'USER' | 'ADMIN';
  status: AdminUserStatus;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
};
