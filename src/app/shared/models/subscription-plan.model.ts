// src/app/shared/models/subscription-plan.model.ts

/**
 * Tipos fixos de plano disponíveis no sistema.
 */
export type SubscriptionPlanId = 'Free' | 'Unlimited';

/**
 * Modelo descritivo de um plano de assinatura.
 */
export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: number;
  features: string[];
  limits: {
    maxClients: number;
    maxEmployees: number;
    maxProducts: number;
    maxMonthlySales: number;
    enableStockReports: boolean;
    enableBackup: boolean;
    enableSupport: boolean;
  };
}

/**
 * Planos disponíveis para utilização no sistema.
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'Free',
    name: 'Plano Gratuito',
    price: 0,
    features: [
      'Cadastro limitado de produtos',
      'Registro de vendas (até 30/mês)',
      'Relatórios básicos',
    ],
    limits: {
      maxClients: 50,
      maxEmployees: 2,
      maxProducts: 50,
      maxMonthlySales: 30,
      enableStockReports: false,
      enableBackup: false,
      enableSupport: false,
    },
  },
  {
    id: 'Unlimited',
    name: 'Plano Ilimitado',
    price: 150,
    features: [
      'Todos os recursos do sistema',
      'Suporte técnico',
      'Backup automático',
    ],
    limits: {
      maxClients: Infinity,
      maxEmployees: Infinity,
      maxProducts: Infinity,
      maxMonthlySales: Infinity,
      enableStockReports: true,
      enableBackup: true,
      enableSupport: true,
    },
  },
];
