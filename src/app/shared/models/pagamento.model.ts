

import { AuthenticatedUser } from './auth.model';
export interface HistoricoPagamento {
  client: Pick<AuthenticatedUser, 'id' | 'first_name' | 'last_name'>; 
  valor: number;
  status: 'realizado' | 'pendente' | 'atrasado' | 'cancelado';
  data: string; // Data do pagamento
  vencimento: string; // Data de vencimento
}


export interface BoletoResponse {
  url: string; 
  vencimento: string; 
  valor: number; 
}
