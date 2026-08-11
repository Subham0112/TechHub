import axios from "axios";

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: string } | undefined;
    return data?.errors || data?.message || fallback;
  }
  return fallback;
};
