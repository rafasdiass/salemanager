// src/app/shared/services/produto.service.ts

import {
  Injectable,
  inject,
  signal,
  computed,
  effect,
  WritableSignal,
} from '@angular/core';
import { Firestore, collection, query, where } from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable, Subscription } from 'rxjs';

import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Produto } from '../models/produto.model';
import { AuthService } from './auth.service';
import { ProdutoBusinessRulesService } from '../regras/produto-business-rules.service';

@Injectable({ providedIn: 'root' })
export class ProdutoService extends BaseFirestoreCrudService<Produto> {
  private readonly _produtos: WritableSignal<Produto[]> = signal([]);
  readonly produtos = computed(() => this._produtos());

  private produtoSub?: Subscription;

  public override readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly businessRulesService = inject(ProdutoBusinessRulesService);

  constructor() {
    super('produtos');
    this.businessRules = this.businessRulesService;
    this.initProdutosSync();
  }

  /**
   * Inicializa a sincronização dos produtos da empresa logada.
   */
  private initProdutosSync(): void {
    effect(() => {
      const companyId = this.authService.user()?.companyId;

      if (!companyId) {
        this._produtos.set([]);
        return;
      }

      this.produtoSub?.unsubscribe();

      const produtosRef = collection(this.firestore, 'produtos');
      const q = query(produtosRef, where('companyId', '==', companyId));

      const obs$ = collectionData(q, { idField: 'id' }) as Observable<
        Produto[]
      >;

      this.produtoSub = obs$.subscribe({
        next: (produtos) => this._produtos.set(produtos),
        error: (err) => {
          console.error('[ProdutoService] Erro ao carregar produtos:', err);
          this._produtos.set([]);
        },
      });
    });
  }

  /**
   * Retorna um produto diretamente da memória (signal).
   */
  getByIdFromSignal(id: string): Produto | undefined {
    return this._produtos().find((p) => p.id === id);
  }

  /**
   * Decrementa o estoque de um produto após venda.
   * @throws se estoque insuficiente ou produto não existir
   */
  async decrementEstoque(produtoId: string, quantidade: number): Promise<void> {
    const produto = this.getByIdFromSignal(produtoId);

    if (!produto) throw new Error('Produto não encontrado.');
    if (produto.estoque < quantidade) {
      throw new Error(`Estoque insuficiente para o produto: ${produto.nome}`);
    }

    const atualizado: Produto = {
      ...produto,
      estoque: produto.estoque - quantidade,
      updatedAt: new Date(),
    };

    await this.update(produtoId, atualizado);
  }

  /**
   * Incrementa o estoque de um produto (ex: devolução/cancelamento de venda).
   */
  async incrementarEstoque(
    produtoId: string,
    quantidade: number
  ): Promise<void> {
    const produto = this.getByIdFromSignal(produtoId);

    if (!produto) throw new Error('Produto não encontrado.');

    const atualizado: Produto = {
      ...produto,
      estoque: produto.estoque + quantidade,
      updatedAt: new Date(),
    };

    await this.update(produtoId, atualizado);
  }

  /**
   * Retorna todos os produtos com estoque zerado ou negativo (alerta).
   */
  getProdutosSemEstoque(): Produto[] {
    return this.produtos().filter((p) => p.estoque <= 0);
  }

  /**
   * Retorna todos os produtos de uma determinada categoria.
   */
  getProdutosPorCategoria(categoria: string): Produto[] {
    return this.produtos().filter((p) => p.categoria === categoria);
  }
}
