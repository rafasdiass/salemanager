// client.model.ts

// Importa a interface BaseEntity de um arquivo dedicado, garantindo padronização dos campos comuns.
import { BaseEntity } from './base-entity.model';

// Interface para informações pessoais do usuário, que podem ser extraídas de um módulo ou definidas localmente.
export interface Person {
  name: string;
  phone?: string;
  email?: string;
  birthDate?: Date;
}

// Interface para padronizar o endereço, garantindo consistência no formato.
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

/* ========== CLIENT ========== */

/**
 * Interface Client
 *
 * Esta interface estende BaseEntity para incluir os campos comuns (como id, createdAt e updatedAt),
 * e também Person para unificar os dados pessoais.
 *
 * Além disso, foi adicionado o campo 'companyIds' para permitir que o cliente esteja vinculado a múltiplas empresas.
 */
export interface Client extends BaseEntity, Person {
  // Endereço completo do cliente.
  address: Address;

  // Campo adicional para aceitar múltiplas empresas.
  companyIds?: string[];

  // Campo opcional para anotações adicionais.
  notes?: string;

  // Preferências do cliente, tais como serviços e profissionais preferenciais, além de opções de notificação.
  preferences?: {
    preferredServices?: string[];
    preferredProfessionals?: string[];
    notificationPreferences?: {
      email?: boolean;
      sms?: boolean;
      whatsapp?: boolean;
    };
  };

  // Pontos de fidelidade do cliente.
  loyaltyPoints?: number;

  // Total gasto pelo cliente.
  totalSpent?: number;

  // Data da última visita do cliente.
  lastVisit?: Date;
}
