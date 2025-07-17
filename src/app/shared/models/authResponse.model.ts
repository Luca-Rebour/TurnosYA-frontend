export interface AuthResponse {
  token: string;
  userId: number;
  role: 'customer' | 'professional' | 'admin';
  expiration: number;
}
