// src/app/shared/services/venda.service.ts

import {
  Injectable,
  signal,
  computed,
  effect,
  WritableSignal,
  inject,
} from '@angular/core';
import { Firestore, collection, query, where } from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable, Subscription } from 'rxjs';

import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Venda } from '../models/venda.model';
import { AuthService } from './auth.service';
import { VendaBusinessRulesService } from '../regras/venda-business-rules.service';
import { ProdutoService } from './produto.service';

@Injectable({ providedIn: 'root' })
export class VendaService extends BaseFirestoreCrudService<Venda> {
  private readonly _vendas: WritableSignal<Venda[]> = signal([]);
  readonly vendas = computed(() => this._vendas());

  private vendaSub?: Subscription;

  public override readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly businessRulesService = inject(VendaBusinessRulesService);
  private readonly produtoService = inject(ProdutoService);

  constructor() {
    super('vendas');
    this.businessRules = this.businessRulesService;
    this.initFilteredVendas();
  }

  /**
   * Sincroniza a lista de vendas da empresa autenticada.
   */
  private initFilteredVendas(): void {
    effect(() => {
      const companyId = this.authService.user()?.companyId;
      if (!companyId) {
        this._vendas.set([]);
        return;
      }

      this.vendaSub?.unsubscribe();

      const ref = collection(this.firestore, 'vendas');
      const q = query(ref, where('companyId', '==', companyId));

      const obs$ = collectionData(q, { idField: 'id' }) as Observable<Venda[]>;

      this.vendaSub = obs$.subscribe({
        next: (vendas) => this._vendas.set(vendas),
        error: (err) => {
          console.error('[VendaService] Erro ao carregar vendas:', err);
          this._vendas.set([]);
        },
      });
    });
  }

  /**
   * Retorna todas as vendas feitas por um funcionário específico.
   */
  getVendasByEmployee(employeeId: string): Venda[] {
    return this.vendas().filter((venda) => venda.createdBy === employeeId);
  }

  /**
   * Retorna uma venda específica diretamente da memória.
   */
  getByIdFromSignal(id: string): Venda | undefined {
    return this.vendas().find((venda) => venda.id === id);
  }

  /**
   * Retorna todas as vendas de um cliente específico.
   */
  getVendasByClient(clienteId: string): Venda[] {
    return this.vendas().filter((venda) => venda.clienteId === clienteId);
  }

  /**
   * Retorna todas as vendas canceladas.
   */
  getVendasCanceladas(): Venda[] {
    return this.vendas().filter((venda) => venda.cancelada === true);
  }

  /**
   * Cancela uma venda e repõe o estoque dos produtos envolvidos.
   * @param vendaId ID da venda
   * @param userId ID de quem está cancelando
   */
  async cancelarVenda(vendaId: string, userId: string): Promise<void> {
    const venda = this.getByIdFromSignal(vendaId);
    if (!venda) throw new Error('Venda não encontrada.');
    if (venda.cancelada) throw new Error('Venda já foi cancelada.');

    for (const item of venda.itens) {
      await this.produtoService.incrementarEstoque(
        item.produtoId,
        item.quantidade
      );
    }

    await this.update(vendaId, {
      ...venda,
      cancelada: true,
      canceladaPor: userId,
      canceladaEm: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Retorna vendas dentro de um intervalo de datas.
   */
  getVendasPorPeriodo(inicio: Date, fim: Date): Venda[] {
    return this.vendas().filter((v) => {
      const data = new Date(v.data);
      return data >= inicio && data <= fim;
    });
  }

  /**
   * Retorna vendas feitas hoje.
   */
  getVendasDoDia(): Venda[] {
    const hoje = new Date();
    const inicio = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      0,
      0,
      0
    );
    const fim = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      23,
      59,
      59
    );
    return this.getVendasPorPeriodo(inicio, fim);
  }

  /**
   * Retorna vendas do mês atual.
   */
  getVendasDoMes(): Venda[] {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      0,
      23,
      59,
      59
    );
    return this.getVendasPorPeriodo(inicio, fim);
  }

  /**
   * Retorna vendas do ano atual.
   */
  getVendasDoAno(): Venda[] {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), 0, 1);
    const fim = new Date(hoje.getFullYear(), 11, 31, 23, 59, 59);
    return this.getVendasPorPeriodo(inicio, fim);
  }
}
