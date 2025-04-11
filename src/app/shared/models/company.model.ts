import { Address } from './address.model';

/**
 * Representa a entidade de salão/barbearia (Company).
 */
export interface Company {
  id?: string;
  name: string;
  cnpj?: string;
  address: Address;
  phone?: string;
  email?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  subscriptionPlanId: string;
  activeUntil?: Date;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: 'Free' | 'Pro' | 'Unlimited';
  price: number;
  maxAppointmentsPerMonth: number;
  features: string[];
}
