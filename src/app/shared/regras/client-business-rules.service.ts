// src/app/shared/regras/client-business-rules.service.ts

import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';
import { Cliente } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientBusinessRulesService
  implements EntityBusinessRules<Cliente>
{
  private readonly firestore = inject(Firestore);

  async prepareForCreate(client: Cliente): Promise<Cliente> {
    const now = new Date();
    client.createdAt = now;
    client.updatedAt = now;

    if (!client.companyId) {
      throw new Error('Cliente deve estar vinculado a uma empresa.');
    }

    await this.assertNoDuplicateEmail(client.email, client.companyId);
    return client;
  }

  async prepareForUpdate(
    newClient: Cliente,
    oldClient: Cliente
  ): Promise<Cliente> {
    newClient.updatedAt = new Date();

    if (newClient.companyId !== oldClient.companyId) {
      throw new Error(
        'Não é permitido alterar o vínculo da empresa do cliente.'
      );
    }

    return newClient;
  }

  /** Valida se já existe cliente com o mesmo e-mail na mesma empresa */
  private async assertNoDuplicateEmail(
    email?: string,
    companyId?: string
  ): Promise<void> {
    if (!email || !companyId) return;

    const clientsRef = collection(this.firestore, 'clientes');
    const q = query(
      clientsRef,
      where('email', '==', email),
      where('companyId', '==', companyId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error('Já existe um cliente com este e-mail nesta empresa.');
    }
  }
}
