export interface AuthenticatedUser {
  id: string; // ID único do client no sistema
  cpf: string; // CPF usado para login
  email: string; // E-mail para comunicação ou recuperação de senha
  role: 'ADMIN' | 'employee' | 'client'; // Papel para controle de acesso
  first_name: string; // Nome do client
  last_name: string; // Sobrenome do client
  phone: string; // Telefone de contato
  address?: {
    street: string; // Rua
    number: string; // Número
    neighborhood: string; // Bairro
    city: string; // Cidade
    state: string; // Estado
    postal_code: string; // CEP
  };
  registration_date: string; // Data de registro no sistema
  is_active: boolean; // Indica se o client está ativo
  employeeId?: string; // ID do employee associado
  createdAt: string; // Data de criação do registro
  updatedAt: string; // Data da última atualização do registro
  password?: string; // Senha do usuário (pode estar vazia no primeiro login)
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  token: string | null;
}

export interface LoginRequest {
  cpf: string; // CPF do usuário
  password: string; // Senha do usuário
}

export interface LoginResponse {
  access_token: string; // Token de autenticação
  user: AuthenticatedUser; // Informações do usuário autenticado
}
