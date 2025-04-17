// src/app/shared/services/clients.service.ts

import {
  Injectable,
  signal,
  computed,
  effect,
  WritableSignal,
} from '@angular/core';
import { Client } from '../models/client.model';
import { AuthService } from './auth.service';
import { ClientBusinessRulesService } from '../regras/client-business-rules.service';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { collection, query, where } from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClientService extends BaseFirestoreCrudService<Client> {
  private readonly _filteredClients: WritableSignal<Client[]> = signal([]);
  readonly filteredClients = computed(() => this._filteredClients());

  private sub?: Subscription;

  constructor(
    private readonly rules: ClientBusinessRulesService,
    private readonly authService: AuthService
  ) {
    // 'clients' é o nome da coleção no Firestore
    super('clients');
    this.businessRules = this.rules;
    this.initFilteredList();
  }

  private initFilteredList(): void {
    effect(() => {
      // 1) Pega o ID da empresa atual
      const companyId = this.authService.primaryCompanyId();

      // 2) Cancela a assinatura anterior, se existir
      this.sub?.unsubscribe();

      // 3) Monta a query: somente clientes ativos da empresa
      const clientsCol = collection(this.firestore, 'clients');
      const q = query(
        clientsCol,
        where('companyIds', 'array-contains', companyId),
        where('is_active', '==', true)
      );

      // 4) Usa rxfire para ouvir em tempo real
      const obs$ = collectionData(q, { idField: 'id' }) as Observable<Client[]>;

      // 5) Atualiza o signal sempre que chegar nova lista
      this.sub = obs$.subscribe({
        next: (clients) => this._filteredClients.set(clients),
        error: () => this._filteredClients.set([]),
      });
    });
  }

  /**
   * Lookup rápido em memória, sem nova chamada ao Firestore.
   */
  getByIdFromSignal(id: string): Client | undefined {
    return this.filteredClients().find((c) => c.id === id);
  }

  /**
   * Marca cliente como inativo e registra data de inativação nas notas.
   */
  async markAsInactive(clientId: string): Promise<void> {
    const client = await this.getById(clientId).toPromise();
    if (!client) throw new Error('Cliente não encontrado.');

    await this.update(clientId, {
      ...client,
      updatedAt: new Date(),
      notes: `${
        client.notes || ''
      }\nDesativado em ${new Date().toLocaleDateString()}`,
    }).toPromise();
  }

  /**
   * Atualiza a data da última visita do cliente.
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
