// src/app/shared/models/service.model.ts

export interface Service {
  id?: string;
  companyId: string;
  name: string; // Ex: Corte masculino, Escova, Progressiva
  description?: string;
  duration: number; // em minutos
  price: number;
  isActive: boolean;
  professionalsIds?: string[]; // IDs dos funcionários que realizam
  createdAt?: Date;
  updatedAt?: Date;
  categoryId?: string;
}
