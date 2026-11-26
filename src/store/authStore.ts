import { create } from 'zustand';

import { authApi } from '../services/authApi';
import { setSessionExpiredHandler } from '../services/http';
import { tokenVault } from '../services/tokenVault';
import type {
  AuthResponse,
  RegisterPayload,
  RegistrationResponse,
  UserSession,
} from '../types/auth';

type AuthStatus = 'loading' | 'startupError' | 'signedOut' | 'signedIn';
type AuthState = {
  status: AuthStatus;
  startupMessage: string | null;
  user: UserSession | null;
  initialize: () => Promise<void>;
  continueSignedOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegistrationResponse>;
  refreshUser: () => Promise<void>;
  completeOnboarding: () => void;
  updateProfilePicture: (url?: string) => void;
  logout: () => Promise<void>;
};

const STARTUP_REQUEST_TIMEOUT_MS = 20_000;

function withStartupTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('STARTUP_REQUEST_TIMEOUT')),
      STARTUP_REQUEST_TIMEOUT_MS,
    );

    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

async function persistSession(response: AuthResponse) {
  await tokenVault.write({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  startupMessage: null,
  user: null,
  async initialize() {
    set({ status: 'loading', startupMessage: null });
    try {
      const tokens = await tokenVault.read();
      if (!tokens) {
        set({ status: 'signedOut', startupMessage: null, user: null });
        return;
      }

      const user = await withStartupTimeout(authApi.currentUser());
      set({ status: 'signedIn', startupMessage: null, user });
    } catch {
      if (!tokenVault.getRefreshToken()) {
        await tokenVault.clear().catch(() => undefined);
        set({ status: 'signedOut', startupMessage: null, user: null });
        return;
      }

      set({
        status: 'startupError',
        startupMessage:
          'GymBro could not reach the server. It may still be waking up.',
        user: null,
      });
    }
  },
  async continueSignedOut() {
    try {
      await tokenVault.clear();
    } finally {
      set({ status: 'signedOut', startupMessage: null, user: null });
    }
  },
  async login(email, password) {
    const response = await authApi.login(email, password);
    await persistSession(response);
    set({ status: 'signedIn', startupMessage: null, user: response.user });
  },
  async register(payload) {
    return authApi.register(payload);
  },
  async refreshUser() {
    set({ user: await authApi.currentUser() });
  },
  completeOnboarding() {
    const user = get().user;
    if (user) {
      set({ user: { ...user, onboardingComplete: true } });
    }
  },
  updateProfilePicture(url) {
    const user = get().user;
    if (user) set({ user: { ...user, profilePictureUrl: url } });
  },
  async logout() {
    const refreshToken = tokenVault.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      await tokenVault.clear();
      set({ status: 'signedOut', startupMessage: null, user: null });
    }
  },
}));

setSessionExpiredHandler(() => {
  useAuthStore.setState({
    status: 'signedOut',
    startupMessage: null,
    user: null,
  });
});
