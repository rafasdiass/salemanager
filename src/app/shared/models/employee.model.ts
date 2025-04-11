/**
 * @file employee-user.model.ts
 * Unifica a lógica do "employee" com o "EmployeeUser" do modelo maior,
 * agora estendendo de AuthenticatedUser com as novas interfaces atualizadas.
 */

import { AuthenticatedUser } from './auth.model';
import { Client } from './client.model';
import { WeekDay } from './week-day.type';

/**
 * Representa o funcionário (employee) em um salão/barbearia
 * dentro do novo modelo de negócios.
 */
export interface EmployeeUser
  extends Omit<AuthenticatedUser, 'role' | 'companyIds' | 'couponUsed'> {
  /**
   * Define o papel fixo de 'employee' para este usuário.
   */
  role: 'employee';

  /**
   * Identifica o salão (Company) ao qual o employee pertence.
   * Caso seja necessário permitir multissalões para o funcionário,
   * pode-se substituir por companyIds?: string[].
   */
  companyId: string;

  /**
   * Especialidades do funcionário (ex.: barbeiro, colorista, etc.).
   */
  specialties?: string[];

  /**
   * Comissão que o funcionário recebe, se aplicável.
   */
  commission?: number;

  /**
   * Horários de trabalho (workingHours), definindo um intervalo
   * { start, end } para cada dia da semana.
   */
  workingHours?: Record<WeekDay, { start: string; end: string }>;

  /**
   * Lista de folgas ou dias de ausência do funcionário.
   */
  daysOff?: Date[];

  /**
   * Lista de clientes associados ao employee, utilizando a interface
   * atualizada Client.
   *
   * Em muitos casos, a associação entre funcionário e clientes pode
   * ser realizada através da tabela de Agendamentos (Appointments).
   */
  clients?: Client[];

  /**
   * Dados de desempenho ou resumo relacionados ao employee, se necessário.
   */
  desempenho?: {
    totalClients: number; // Total de clientes gerenciados
    totalPendentes: number; // Total de casos pendentes
    totalAtendidos: number; // Total de atendimentos realizados
  };

  /**
   * Data de início de atuação do employee (opcional).
   */
  dataAtuacaoInicio?: string;
}
