import * as Keychain from 'react-native-keychain';

import type { AuthTokens } from '../types/auth';

const TOKEN_SERVICE = 'com.gympilot.auth';
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenVault = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,

  async read(): Promise<AuthTokens | null> {
    const credentials = await Keychain.getGenericPassword({
      service: TOKEN_SERVICE,
    });
    if (!credentials) {
      return null;
    }
    const tokens = JSON.parse(credentials.password) as AuthTokens;
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    return tokens;
  },

  async write(tokens: AuthTokens): Promise<void> {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    await Keychain.setGenericPassword('gympilot', JSON.stringify(tokens), {
      service: TOKEN_SERVICE,
    });
  },

  async clear(): Promise<void> {
    accessToken = null;
    refreshToken = null;
    await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
  },
};
