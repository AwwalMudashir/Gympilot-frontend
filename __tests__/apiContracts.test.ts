jest.mock('../src/services/tokenVault', () => ({
  tokenVault: {getAccessToken: jest.fn(), getRefreshToken: jest.fn(), write: jest.fn(), clear: jest.fn()},
}));

import axios from 'axios';
import {apiErrorMessage, dataOf} from '../src/services/http';

describe('API contract helpers', () => {
  test('unwraps the shared backend response envelope', () => {
    const data = dataOf({data: {success: true, message: 'ok', data: {id: 'user-1'}, timestamp: 'now', path: '/api/test'}});
    expect(data).toEqual({id: 'user-1'});
  });

  test('uses a field error returned by the API', () => {
    const error = new axios.AxiosError('Bad request', '400', undefined, undefined, {
      data: {success: false, message: 'Validation failed', data: null, errors: [{code: 'INVALID', field: 'email', message: 'Enter a valid email'}], timestamp: 'now', path: '/api/auth/register'},
      status: 400, statusText: 'Bad Request', headers: {}, config: {headers: {} as never},
    });
    expect(apiErrorMessage(error)).toBe('Enter a valid email');
  });

  test('preserves a useful local device error', () => {
    expect(apiErrorMessage(new Error('Choose a profile picture smaller than 5 MB.')))
      .toBe('Choose a profile picture smaller than 5 MB.');
  });
});
