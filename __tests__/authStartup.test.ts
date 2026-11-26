jest.mock('../src/services/tokenVault', () => ({
  tokenVault: {
    read: jest.fn(),
    write: jest.fn(),
    clear: jest.fn(),
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
  },
}));

jest.mock('../src/services/authApi', () => ({
  authApi: {
    currentUser: jest.fn(),
  },
}));

jest.mock('../src/services/http', () => ({
  setSessionExpiredHandler: jest.fn(),
}));

import { authApi } from '../src/services/authApi';
import { tokenVault } from '../src/services/tokenVault';
import { useAuthStore } from '../src/store/authStore';

const mockRead = jest.mocked(tokenVault.read);
const mockClear = jest.mocked(tokenVault.clear);
const mockGetRefreshToken = jest.mocked(tokenVault.getRefreshToken);
const mockCurrentUser = jest.mocked(authApi.currentUser);

describe('authentication startup recovery', () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    useAuthStore.setState({
      status: 'loading',
      startupMessage: null,
      user: null,
    });
  });

  test('opens authentication immediately when no saved session exists', async () => {
    mockRead.mockResolvedValue(null);

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().status).toBe('signedOut');
    expect(mockCurrentUser).not.toHaveBeenCalled();
  });

  test('stops an unreachable server from trapping the app on splash', async () => {
    jest.useFakeTimers();
    mockRead.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    mockGetRefreshToken.mockReturnValue('refresh-token');
    mockCurrentUser.mockReturnValue(new Promise(() => undefined));

    const initialization = useAuthStore.getState().initialize();
    await Promise.resolve();
    await jest.advanceTimersByTimeAsync(20_000);
    await initialization;

    expect(useAuthStore.getState().status).toBe('startupError');
    expect(useAuthStore.getState().startupMessage).toContain(
      'could not reach the server',
    );
    expect(mockClear).not.toHaveBeenCalled();
  });

  test('lets the user discard the saved session from recovery', async () => {
    mockClear.mockResolvedValue(undefined);

    await useAuthStore.getState().continueSignedOut();

    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().status).toBe('signedOut');
  });
});
