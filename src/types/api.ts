export type ApiError = { code: string; field?: string; message: string };
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiError[];
  timestamp: string;
  path: string;
};
