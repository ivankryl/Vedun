//
//  frontend/src/types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'BROKER' | 'INSURER' | 'ANALYST';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  role: 'BROKER' | 'INSURER' | 'ANALYST';
  companyName?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
