// src/app/shared/services/client.service.ts

import {
  Injectable,
  signal,
  WritableSignal,
  computed,
  effect,
} from '@angular/core';
import { collection, query, where } from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable, Subscription } from 'rxjs';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { ClientBusinessRulesService } from '../regras/client-business-rules.service';
import { Cliente } from '../models/cliente.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ClientService extends BaseFirestoreCrudService<Cliente> {
  private readonly _filteredClients: WritableSignal<Cliente[]> = signal([]);
  readonly filteredClients = computed(() => this._filteredClients());

  private sub?: Subscription;

  constructor(
    private readonly rules: ClientBusinessRulesService,
    private readonly authService: AuthService
  ) {
    super('clients');
    this.businessRules = this.rules;
    this.initFilteredList();
  }

  /**
   * Sincroniza em tempo real os clientes ativos da empresa autenticada.
   */
  private initFilteredList(): void {
    effect(() => {
      const companyId = this.authService.companyId();

      this.sub?.unsubscribe();

      const q = query(
        collection(this.firestore, 'clients'),
        where('companyId', '==', companyId),
        where('is_active', '==', true)
      );

      const obs$ = collectionData(q, { idField: 'id' }) as Observable<
        Cliente[]
      >;

      this.sub = obs$.subscribe({
        next: (list) => this._filteredClients.set(list),
        error: () => this._filteredClients.set([]),
      });
    });
  }

  /**
   * Acesso rápido ao cliente já em memória.
   */
  getByIdFromSignal(id: string): Cliente | undefined {
    return this.filteredClients().find((c) => c.id === id);
  }

  /**
   * Marca cliente como inativo e registra nota com data.
   */
  async markAsInactive(clientId: string): Promise<void> {
    const client = await this.getById(clientId).toPromise();
    if (!client) throw new Error('Cliente não encontrado.');

    await this.update(clientId, {
      ...client,
      updatedAt: new Date(),
      is_active: false,
      observacoes: `${
        client.observacoes || ''
      }\nDesativado em ${new Date().toLocaleDateString()}`,
    }).toPromise();
  }

  /**
   * Atualiza a data da última visita.
   */
  async updateLastVisit(clientId: string): Promise<void> {
    const client = await this.getById(clientId).toPromise();
    if (!client) throw new Error('Cliente não encontrado.');

    await this.update(clientId, {
      ...client,
      lastVisit: new Date(),
      updatedAt: new Date(),
    }).toPromise();
  }
}
