import { AuthenticatedUser } from './auth.model';
import { client } from './client.model';
import { PropostaAdesao } from './proposta-adesao.model';

/**
 * Representa os dados do employee.
 */
export interface employee extends Omit<AuthenticatedUser, 'employeeId'> {
  /**
   * Lista de clients associados ao employee.
   */
  clients?: client[]; // Lista de clients gerenciados pelo employee.

  /**
   * Lista de adesões criadas e gerenciadas pelo employee.
   */
  adesoes?: PropostaAdesao[]; // Lista de propostas de adesão gerenciadas.

  /**
   * Dados de desempenho ou resumo relacionados ao employee.
   */
  desempenho?: {
    totalclients: number; // Total de clients gerenciados.
    totalAdesoes: number; // Total de adesões gerenciadas.
    totalPendentes: number; // Total de adesões pendentes.
    totalAprovadas: number; // Total de adesões aprovadas.
  };

  /**
   * Data de início de atuação do employee.
   */
  dataAtuacaoInicio: string; // Data em que o employee começou a atuar.
}
