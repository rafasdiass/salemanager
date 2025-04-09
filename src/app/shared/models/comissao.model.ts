import { employee } from './employee.model';
import { PropostaAdesao } from './proposta-adesao.model';
import { client } from './client.model';

/**
 * Representa os dados de comissão de um employee, pagos em três períodos distintos.
 */
export interface Comissao {
  employee: Pick<employee, 'first_name' | 'last_name' | 'email'>;

  /**
   * Lista de adesões vinculadas ao employee.
   */
  adesoes: Array<
    Pick<
      PropostaAdesao,
      'titulo' | 'status' | 'valorAdesao' | 'dataCriacao'
    > & {
      associado: Pick<client, 'first_name' | 'last_name'>;
    }
  >;

  /**
   * Total de vendas (adesões) realizadas no mês corrente.
   */
  totalVendasMensal: number;

  /**
   * Comissão fixa atribuída ao employee por cada venda.
   */
  comissaoFixaPorVenda: number;

  /**
   * Pagamentos de comissão organizados por período.
   */
  pagamentosPorPeriodo: Record<PeriodoPagamento, PaymentPeriod>;

  /**
   * Valor total da comissão recebida no mês.
   */
  totalComissao: number;
}

/**
 * Define claramente os períodos de pagamento disponíveis.
 */
export type PeriodoPagamento = 'periodo1' | 'periodo2' | 'periodo3';

/**
 * Define um período de pagamento contendo:
 * - O total recebido naquele período.
 * - Uma lista de pagamentos efetuados.
 */
export interface PaymentPeriod {
  totalRecebido: number;
  pagamentos: Array<PagamentoComissao>;
}

/**
 * Representa cada pagamento individual da comissão.
 */
export interface PagamentoComissao {
  vendaReferencia: string; // Identificação da venda (por título ou outro identificador único)
  valorPago: number; // Valor pago referente à venda
}
