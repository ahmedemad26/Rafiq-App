declare type ErrorResponse = {
  msg?: string;
  message: string;
  code: number;
};

declare type SuccessResponse<T> = {
  message: string;
} & T;

declare type ApiResponse<T> = ErrorResponse | SuccessResponse<T>;
