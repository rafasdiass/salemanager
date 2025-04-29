// src/app/shared/models/company.model.ts

import { Address } from './address.model';
import { BaseEntity } from './base-entity.model';
import { SubscriptionPlanId } from './subscription-plan.model';

/**
 * Representa uma empresa genérica que utiliza o sistema.
 * Cada empresa possui um administrador, endereço e plano de assinatura.
 */
export interface Company extends BaseEntity {
  name: string;
  cnpj?: string;
  address: Address;
  phone?: string;
  email?: string;
  subscriptionPlanId: SubscriptionPlanId;
  activeUntil?: Date;
  ownerId: string; // ID do usuário administrador principal da empresa
}
