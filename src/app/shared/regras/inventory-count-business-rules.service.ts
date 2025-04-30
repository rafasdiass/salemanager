import { Injectable } from '@angular/core';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';
import { InventoryCount } from '../models/historico-contagem.model';

@Injectable({ providedIn: 'root' })
export class InventoryCountBusinessRulesService
  implements EntityBusinessRules<InventoryCount>
{
  async prepareForCreate(count: InventoryCount): Promise<InventoryCount> {
    const now = new Date();
    count.createdAt = now;
    count.updatedAt = now;

    if (!count.itens?.length) {
      throw new Error('A contagem de inventário deve conter ao menos um item.');
    }

    for (const item of count.itens) {
      if (!item.produtoId || item.produtoId.trim() === '') {
        throw new Error('Produto com ID inválido na contagem.');
      }
      if (item.estoqueFisico < 0) {
        throw new Error('Quantidade física não pode ser negativa.');
      }
    }

    return count;
  }

  async prepareForUpdate(
    newData: InventoryCount,
    oldData: InventoryCount
  ): Promise<InventoryCount> {
    newData.updatedAt = new Date();

    if (newData.itens?.some((item) => item.estoqueFisico < 0)) {
      throw new Error('Quantidade física não pode ser negativa.');
    }

    return newData;
  }
}
