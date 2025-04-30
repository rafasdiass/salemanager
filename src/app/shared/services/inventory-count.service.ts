// src/app/shared/services/inventory-count.service.ts

import {
  Injectable,
  signal,
  computed,
  WritableSignal,
  inject,
  effect,
} from '@angular/core';
import { Firestore, collection, query, where } from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable, Subscription } from 'rxjs';

import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { InventoryCount } from '../models/historico-contagem.model';
import { AuthService } from './auth.service';
import { ProdutoService } from './produto.service';
import { InventoryCountBusinessRulesService } from '../regras/inventory-count-business-rules.service';
import { Produto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class InventoryCountService extends BaseFirestoreCrudService<InventoryCount> {
  private readonly _contagens: WritableSignal<InventoryCount[]> = signal([]);
  readonly contagens = computed(() => this._contagens());

  private contagemSub?: Subscription;

  public override readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly produtoService = inject(ProdutoService);
  private readonly businessRulesService = inject(
    InventoryCountBusinessRulesService
  );

  constructor() {
    super('inventory-counts');
    this.businessRules = this.businessRulesService;
    this.initFilteredContagens();
  }

  private initFilteredContagens(): void {
    effect(() => {
      const companyId = this.authService.user()?.companyId;
      if (!companyId) {
        this._contagens.set([]);
        return;
      }

      this.contagemSub?.unsubscribe();

      const colRef = collection(this.firestore, 'inventory-counts');
      const q = query(colRef, where('companyId', '==', companyId));
      const obs$ = collectionData(q, { idField: 'id' }) as Observable<
        InventoryCount[]
      >;

      this.contagemSub = obs$.subscribe({
        next: (data) => this._contagens.set(data),
        error: (err) => {
          console.error(
            '[InventoryCountService] Erro ao carregar contagens:',
            err
          );
          this._contagens.set([]);
        },
      });
    });
  }

  /**
   * Aplica correções de estoque com base na última contagem informada.
   */
  async aplicarContagem(count: InventoryCount): Promise<void> {
    for (const item of count.itens) {
      const produto = this.produtoService.getByIdFromSignal(item.produtoId);
      if (!produto) {
        console.warn(`Produto não encontrado: ${item.produtoId}`);
        continue;
      }

      const atualizado: Produto = {
        ...produto,
        estoque: item.estoqueFisico,
        updatedAt: new Date(),
      };

      await this.produtoService.update(produto.id!, atualizado);
    }
  }
}
