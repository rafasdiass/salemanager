// src/app/shared/regras/produto-business-rules.service.ts

import { Injectable } from '@angular/core';
import { Produto } from '../models/produto.model';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';

@Injectable({ providedIn: 'root' })
export class ProdutoBusinessRulesService
  implements EntityBusinessRules<Produto>
{
  /**
   * Validações e ajustes antes da criação de um novo produto.
   */
  async prepareForCreate(produto: Produto): Promise<Produto> {
    const now = new Date();
    produto.createdAt = now;
    produto.updatedAt = now;

    this.validarCamposObrigatorios(produto);
    this.validarEstoqueInicial(produto.estoque);
    this.validarPreco(produto.preco);

    return produto;
  }

  /**
   * Validações e ajustes antes da atualização de um produto existente.
   */
  async prepareForUpdate(novo: Produto, antigo: Produto): Promise<Produto> {
    novo.updatedAt = new Date();

    this.validarEstoqueInicial(novo.estoque);
    this.validarPreco(novo.preco);

    // Impede mudança de ID
    if (novo.id !== antigo.id) {
      throw new Error('Não é permitido alterar o ID do produto.');
    }

    return novo;
  }

  /**
   * Valida campos obrigatórios como nome e preço.
   */
  private validarCamposObrigatorios(produto: Produto): void {
    if (!produto.nome || !produto.nome.trim()) {
      throw new Error('O nome do produto é obrigatório.');
    }
  }

  /**
   * Garante que o estoque não seja negativo.
   */
  private validarEstoqueInicial(estoque: number): void {
    if (estoque < 0) {
      throw new Error('O estoque não pode ser negativo.');
    }
  }

  /**
   * Garante que o preço seja válido.
   */
  private validarPreco(preco: number): void {
    if (preco < 0) {
      throw new Error('O preço do produto deve ser maior ou igual a zero.');
    }
  }
}
