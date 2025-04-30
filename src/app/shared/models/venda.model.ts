import { VendaItem } from './venda-item.model';

export interface Venda {
  id?: string;
  data: Date;
  valorTotal: number;
  formaPagamento: 'PIX' | 'DINHEIRO' | 'CARTAO' | 'OUTRO';
  itens: VendaItem[];
  createdBy: string;
  clienteId?: string;
  cancelada?: boolean; // ← NOVO
  canceladaPor?: string; // ← NOVO
  canceladaEm?: Date; // ← NOVO
  createdAt?: Date;
  updatedAt?: Date;
}
