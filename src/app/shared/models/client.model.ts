import { AuthenticatedUser } from './auth.model';
import { PropostaAdesao } from './proposta-adesao.model';

/**
 * Representa os dados do client.
 */
export interface client extends Omit<AuthenticatedUser, 'employeeId'> {
  employeeId: string; // ID do employee associado ao client

  /**
   * Status do client ('pendente', 'aprovado', 'rejeitado').
   */
  status: 'pendente' | 'aprovado' | 'rejeitado';

  /**
   * Adesões associadas ao client.
   */
  adesoes?: PropostaAdesao[];

  /**
   * Informações financeiras relacionadas ao client.
   */
  financeiro?: {
    totalAdesoes: number;
    totalPagoSemJuros: number;
    totalPagoComJuros: number;
    saldoDevedorSemJuros: number;
    saldoDevedorComJuros: number;
  };
}
