export interface InventoryItemCount {
  produtoId: string;
  nomeProduto: string;
  estoqueSistema: number; // valor atual no sistema
  estoqueFisico: number; // valor contado manualmente
  diferenca: number; // diferença entre sistema e físico (pode ser negativo)
}

export interface InventoryCount {
  id?: string;
  empresaId: string;
  realizadaPor: string; // ID do usuário que fez a contagem
  data: Date; // data da contagem
  itens: InventoryItemCount[];
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
