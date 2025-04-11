// src/app/shared/services/clients.service.ts

import {
  Injectable,
  signal,
  computed,
  effect,
  WritableSignal,
} from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Client } from '../models/client.model';
import { ClientBusinessRulesService } from '../regras/client-business-rules.service';
import { AuthService } from './auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

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

      const clientsSignal = toSignal(
        this.db
          .collection<Client>('clients', (ref) =>
            ref.where('companyIds', 'array-contains', companyId)
          )
          .valueChanges({ idField: 'id' }),
        { initialValue: [] }
      );

      this._filteredClients.set(clientsSignal());
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
