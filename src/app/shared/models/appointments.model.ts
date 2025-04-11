import { BaseEntity } from './base-entity.model';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'canceled'
  | 'no-show'
  | 'rescheduled';

export type PaymentStatus = 'pending' | 'paid' | 'partial';

export interface Appointment extends BaseEntity {
  companyId: string;
  clientId: string;
  employeeId: string;
  serviceId: string;

  startTime: Date;
  endTime: Date;

  status: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;

  price: number;
  notes?: string;
  cancellationReason?: string;

  createdBy?: string; // ID do usuário que agendou (admin ou funcionário)
}
