import { AuthenticatedUser } from './auth.model';
import { Client } from './client.model';
import { WeekDay } from './week-day.type';
import { UserRole } from './user-role.enum';

export interface EmployeeUser
  extends Omit<AuthenticatedUser, 'role' | 'companyIds' | 'couponUsed'> {
  role: UserRole.employee; // ✅ Aqui está o ajuste
  companyId: string;
  specialties?: string[];
  commission?: number;
  workingHours?: Record<WeekDay, { start: string; end: string }>;
  daysOff?: Date[];
  clients?: Client[];
  desempenho?: {
    totalClients: number;
    totalPendentes: number;
    totalAtendidos: number;
  };
  dataAtuacaoInicio?: string;
}
