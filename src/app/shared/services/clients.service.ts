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
import {  collection, query, where } from '@angular/fire/firestore';
// <-- importa do rxfire, não do @angular/fire
import { collectionData } from 'rxfire/firestore';
import { Observable, Subscription } from 'rxjs';

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

      // Query sem tipagem genérica para evitar converter FirestoreDataConverter
      const clientsCol = collection(this.firestore, 'clients');
      const q = query(
        clientsCol,
        where('companyIds', 'array-contains', companyId)
      );

      // Usa collectionData do rxfire, que aceita 1 ou 2 argumentos
      const obs$ = collectionData(q, { idField: 'id' }) as Observable<Client[]>;

      const sub: Subscription = obs$.subscribe((clients) => {
        this._filteredClients.set(clients);
      });

      return () => sub.unsubscribe();
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
