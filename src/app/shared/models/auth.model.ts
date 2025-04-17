

// src/app/shared/models/authenticated-user.model.ts
import { Address } from './address.model';
import { BaseEntity } from './base-entity.model';
import { UserRole } from './user-role.enum';

export interface AuthenticatedUser extends BaseEntity {
  cpf: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone: string;
  companyIds?: string[];
  couponUsed?: string;
  address?: Address;
  registration_date: string;
  is_active: boolean;               // já existente
  termination_date?: string;        // nova: quando foi demitido (ISO string)
  employeeId?: string;
  password?: string;
}


// Estado de autenticação armazenado no front-end
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  token: string | null;
}

// Requisição de Login (envio de CPF e senha)
export interface LoginRequest {
  cpf?: string;
  email?: string;
  password: string;
}

export interface ClientLoginWithCoupon {
  email: string;
  coupon: string;
}


// Resposta de Login do Backend
export interface LoginResponse {
  access_token: string; // Token de autenticação (JWT ou similar)
  user: AuthenticatedUser; // Informações do usuário autenticado
}
