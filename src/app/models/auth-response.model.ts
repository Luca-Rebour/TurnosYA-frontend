export interface AuthResponse {
    token: string;
    expiration: Date;
    role: string;
    userId: string;
  }