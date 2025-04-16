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
import { toSignal } from '@angular/core/rxjs-interop';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { collection, query, where } from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClientService extends BaseFirestoreCrudService<Client> {
  private readonly _filteredClients: WritableSignal<Client[]> = signal<
    Client[]
  >([]);
  readonly filteredClients = computed(() => this._filteredClients());

  constructor(
    private readonly rules: ClientBusinessRulesService,
    private readonly authService: AuthService
  ) {
    super('clients');
    this.businessRules = this.rules;
    this.initFilteredList();
  }

  private initFilteredList(): void {
    effect(() => {
      const companyId = this.authService.primaryCompanyId();

      const q = query(
        collection(this.firestore, 'clients'),
        where('companyIds', 'array-contains', companyId)
      );

      const obs$: Observable<Client[]> = collectionData(q, {
        idField: 'id',
      }) as Observable<Client[]>;

      const signalClientes = toSignal(obs$, { initialValue: [] });
      this._filteredClients.set(signalClientes());
    });
  }

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
