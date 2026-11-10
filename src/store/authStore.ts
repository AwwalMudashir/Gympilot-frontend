import {create} from 'zustand';

import {authApi} from '../services/authApi';
import {setSessionExpiredHandler} from '../services/http';
import {tokenVault} from '../services/tokenVault';
import type {AuthResponse, RegisterPayload, RegistrationResponse, UserSession} from '../types/auth';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';
type AuthState = {
  status: AuthStatus;
  user: UserSession | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegistrationResponse>;
  refreshUser: () => Promise<void>;
  completeOnboarding: () => void;
  updateProfilePicture: (url?: string) => void;
  logout: () => Promise<void>;
};

async function persistSession(response: AuthResponse) {
  await tokenVault.write({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,
  async initialize() {
    try {
      const tokens = await tokenVault.read();
      if (!tokens) {
        set({status: 'signedOut', user: null});
        return;
      }
      set({status: 'signedIn', user: await authApi.currentUser()});
    } catch {
      await tokenVault.clear();
      set({status: 'signedOut', user: null});
    }
  },
  async login(email, password) {
    const response = await authApi.login(email, password);
    await persistSession(response);
    set({status: 'signedIn', user: response.user});
  },
  async register(payload) {
    return authApi.register(payload);
  },
  async refreshUser() {
    set({user: await authApi.currentUser()});
  },
  completeOnboarding() {
    const user = get().user;
    if (user) {
      set({user: {...user, onboardingComplete: true}});
    }
  },
  updateProfilePicture(url) {
    const user = get().user;
    if (user) set({user: {...user, profilePictureUrl: url}});
  },
  async logout() {
    const refreshToken = tokenVault.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      await tokenVault.clear();
      set({status: 'signedOut', user: null});
    }
  },
}));

setSessionExpiredHandler(() => {
  useAuthStore.setState({status: 'signedOut', user: null});
});
