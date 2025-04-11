import { Injectable } from '@angular/core';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';
import { Client } from '../models/client.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({ providedIn: 'root' })
export class ClientBusinessRulesService implements EntityBusinessRules<Client> {
  constructor(private firestore: AngularFirestore) {}

  async prepareForCreate(client: Client): Promise<Client> {
    const now = new Date();
    client.createdAt = now;
    client.updatedAt = now;
    client.lastVisit = client.lastVisit || now;

    const companyId = client.companyIds?.[0];
    if (!companyId)
      throw new Error('Cliente deve estar vinculado a uma empresa.');

    await this.assertNoDuplicate(client.email!, companyId);
    await this.assertLimitNotExceeded(companyId);

    return client;
  }

  async prepareForUpdate(
    newClient: Client,
    oldClient: Client
  ): Promise<Client> {
    newClient.updatedAt = new Date();

    if (newClient.companyIds?.[0] !== oldClient.companyIds?.[0]) {
      throw new Error(
        'Não é permitido alterar o vínculo principal da empresa do cliente.'
      );
    }

    return newClient;
  }

  private async assertNoDuplicate(
    email: string,
    companyId: string
  ): Promise<void> {
    const snapshot = await this.firestore
      .collection<Client>('clients', (ref) =>
        ref
          .where('email', '==', email)
          .where('companyIds', 'array-contains', companyId)
      )
      .get()
      .toPromise();

    if (snapshot && !snapshot.empty) {
      throw new Error('Este cliente já está vinculado a esta empresa.');
    }
  }

  private async assertLimitNotExceeded(companyId: string): Promise<void> {
    const empresaRef = this.firestore.doc(`empresas/${companyId}`);
    const empresaSnap = await empresaRef.get().toPromise();

    if (!empresaSnap || !empresaSnap.exists) {
      throw new Error('Empresa não encontrada.');
    }

    const empresaData = empresaSnap.data() as { subscriptionPlanId: string };
    const plano = empresaData.subscriptionPlanId;

    const limites: Record<string, number> = {
      Free: 10,
      Pro: 30,
      Unlimited: Infinity,
    };

    const limite = limites[plano] ?? 10;

    const snapshot = await this.firestore
      .collection<Client>('clients', (ref) =>
        ref.where('companyIds', 'array-contains', companyId)
      )
      .get()
      .toPromise();

    if ((snapshot?.size || 0) >= limite) {
      throw new Error(`Limite de clientes atingido para o plano ${plano}.`);
    }
  }
}
