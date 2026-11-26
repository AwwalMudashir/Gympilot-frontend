jest.mock('../src/services/http', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
  dataOf: jest.fn(response => response.data.data),
}));

import { coachApi } from '../src/services/coachApi';
import { apiClient } from '../src/services/http';

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('coach API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ['daily', '/coach/daily'],
    ['weekly', '/coach/weekly'],
  ] as const)('loads the %s brief', async (method, path) => {
    mockedApiClient.get.mockResolvedValue({
      data: { data: { briefType: method.toUpperCase() } },
    } as never);

    await expect(coachApi[method]()).resolves.toEqual({
      briefType: method.toUpperCase(),
    });
    expect(mockedApiClient.get).toHaveBeenCalledWith(path);
  });

  test.each([
    ['regenerateDaily', '/coach/daily/regenerate'],
    ['regenerateWeekly', '/coach/weekly/regenerate'],
  ] as const)('regenerates through %s', async (method, path) => {
    mockedApiClient.post.mockResolvedValue({
      data: { data: { id: 'brief-1' } },
    } as never);

    await expect(coachApi[method]()).resolves.toEqual({ id: 'brief-1' });
    expect(mockedApiClient.post).toHaveBeenCalledWith(path);
  });

  test('records feedback against a specific coaching brief', async () => {
    mockedApiClient.put.mockResolvedValue({
      data: { data: { id: 'brief-1', feedback: 'HELPFUL' } },
    } as never);

    await expect(
      coachApi.recordFeedback('brief-1', 'HELPFUL'),
    ).resolves.toEqual({ id: 'brief-1', feedback: 'HELPFUL' });
    expect(mockedApiClient.put).toHaveBeenCalledWith(
      '/coach/briefs/brief-1/feedback',
      { feedback: 'HELPFUL' },
    );
  });
});
