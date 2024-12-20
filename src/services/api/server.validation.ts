
export const EXPECTED_ERROR_KEY = 'expectedError';

interface ErrorResponse {
  message: string,
  key: string
}

export const getExpectedErrorResponse = (message: string) => {
  const error: ErrorResponse = {
    message,
    key: EXPECTED_ERROR_KEY
  }
  return JSON.stringify(error);
}

export const isExpectedError = (error: any) => {
  return error?.key === EXPECTED_ERROR_KEY;
}
