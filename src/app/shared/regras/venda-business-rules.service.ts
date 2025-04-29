// src/app/shared/regras/venda-business-rules.service.ts

import { Injectable, inject } from '@angular/core';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';
import { Venda } from '../models/venda.model';
import { ProdutoService } from '../services/produto.service';

@Injectable({ providedIn: 'root' })
export class VendaBusinessRulesService implements EntityBusinessRules<Venda> {
  private readonly produtoService = inject(ProdutoService);

  /**
   * Regras aplicadas antes da criação de uma nova venda.
   */
  async prepareForCreate(venda: Venda): Promise<Venda> {
    const now = new Date();
    venda.createdAt = now;
    venda.updatedAt = now;

    if (!venda.itens?.length) {
      throw new Error('A venda deve conter ao menos um item.');
    }

    for (const item of venda.itens) {
      const produto = this.produtoService.getByIdFromSignal(item.produtoId);
      if (!produto) {
        throw new Error(`Produto não encontrado: ${item.nomeProduto}`);
      }

      if (produto.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto: ${produto.nome}`);
      }

      // Decrementa estoque
      await this.produtoService.decrementEstoque(
        item.produtoId,
        item.quantidade
      );
    }

    return venda;
  }

  /**
   * Regras aplicadas antes da atualização de uma venda.
   */
  async prepareForUpdate(nova: Venda, antiga: Venda): Promise<Venda> {
    nova.updatedAt = new Date();
    return nova;
  }

  /**
   * Valida se uma venda pode ser cancelada.
   */
  async validarCancelamento(venda: Venda): Promise<void> {
    if (venda.cancelada) {
      throw new Error('Esta venda já foi cancelada anteriormente.');
    }
  }

  /**
   * Reverte o estoque dos produtos envolvidos em uma venda cancelada.
   */
  async reverterEstoque(venda: Venda): Promise<void> {
    for (const item of venda.itens) {
      await this.produtoService.incrementarEstoque(
        item.produtoId,
        item.quantidade
      );
    }
  }
}
