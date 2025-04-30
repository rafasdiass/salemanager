// src/app/shared/models/cliente.model.ts

import { BaseEntity } from './base-entity.model';
import { Address } from './address.model';

/**
 * Representa um cliente cadastrado na base da empresa.
 * Não é um usuário autenticado, apenas uma entidade de apoio a vendas.
 */
export interface Cliente extends BaseEntity {
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string; // CPF ou CNPJ
  endereco?: Address;
  observacoes?: string;
  companyId: string; // ID da empresa à qual esse cliente pertence

  is_active?: boolean; // Ativo ou inativo no sistema
  lastVisit?: Date; // Última data de compra ou atendimento
}
