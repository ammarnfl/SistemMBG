export type Role = 'ADMIN' | 'TIM_DAPUR' | 'GURU' | 'PENERIMA_MANFAAT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
