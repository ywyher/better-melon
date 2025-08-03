export const datePattern = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; // YYYY-MM-DD

export interface ErrorResponse {
  success: false;
  message: string;
  status?: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}