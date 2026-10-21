export type UserSession = {
  id: string;
  email: string;
  onboardingComplete: boolean;
};

export type AuthTokens = {accessToken: string; refreshToken?: string};

export type AuthResponse = AuthTokens & {user: UserSession};
