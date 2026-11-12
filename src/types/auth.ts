export type UserSession = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  onboardingComplete: boolean;
};

export type AuthTokens = { accessToken: string; refreshToken: string };

export type AuthResponse = AuthTokens & {
  tokenType: string;
  expiresInSeconds: number;
  user: UserSession;
};

export type RegistrationResponse = {
  userId: string;
  email: string;
  verificationRequired: boolean;
  developmentVerificationToken?: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};
