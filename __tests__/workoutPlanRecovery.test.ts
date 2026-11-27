jest.mock('../src/services/http', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
  apiErrorCode: jest.fn((error: { code?: string }) => error.code),
  dataOf: jest.fn(
    (response: { data: { data: { id: string } } }) => response.data.data,
  ),
}));

import { apiClient } from '../src/services/http';
import { workoutApi } from '../src/services/workoutApi';

const get = apiClient.get as jest.Mock;
const post = apiClient.post as jest.Mock;

describe('weekly workout plan recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('restores the saved plan without generating another one', async () => {
    get.mockResolvedValue({ data: { data: { id: 'saved-plan' } } });

    await expect(workoutApi.ensureCurrentPlan()).resolves.toEqual({
      id: 'saved-plan',
    });
    expect(post).not.toHaveBeenCalled();
  });

  test('automatically prepares a plan when the new week has none', async () => {
    get.mockRejectedValue({ code: 'RESOURCE_NOT_FOUND' });
    post.mockResolvedValue({ data: { data: { id: 'new-week-plan' } } });

    await expect(workoutApi.ensureCurrentPlan()).resolves.toEqual({
      id: 'new-week-plan',
    });
    expect(post).toHaveBeenCalledWith('/workouts/plans/generate');
  });

  test('does not mistake a connection failure for a missing plan', async () => {
    const connectionError = { code: 'NETWORK_ERROR' };
    get.mockRejectedValue(connectionError);

    await expect(workoutApi.ensureCurrentPlan()).rejects.toBe(connectionError);
    expect(post).not.toHaveBeenCalled();
  });
});
