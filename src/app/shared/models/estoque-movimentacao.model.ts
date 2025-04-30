export type TipoMovimentacao = 'ENTRADA' | 'SAÍDA';

export type MotivoMovimentacao =
  | 'VENDA'
  | 'REPOSICAO'
  | 'AJUSTE_MANUAL'
  | 'DEVOLUCAO';

export interface EstoqueMovimentacao {
  id?: string;
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  tipo: TipoMovimentacao;
  motivo: MotivoMovimentacao;
  referenciaId?: string; // Ex: ID da venda, devolução ou operação vinculada
  realizadoPor: string; // ID do funcionário/admin
  empresaId: string;
  data: Date;
  observacao?: string;
}
