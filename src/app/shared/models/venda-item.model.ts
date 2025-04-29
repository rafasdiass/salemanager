// src/app/shared/models/venda-item.model.ts

export interface VendaItem {
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}
