//
//  frontend/src/types/auth.ts
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'BROKER' | 'INSURER' | 'ANALYST' | 'CLIENT';
  companyName?: string | null;
  phone?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string;
  role: 'BROKER' | 'INSURER' | 'ANALYST'| 'CLIENT'; // или добавь CLIENT если надо
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
