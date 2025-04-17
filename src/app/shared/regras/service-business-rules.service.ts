// src/app/shared/services/service-business-rules.service.ts

import { Injectable, inject } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Firestore,
} from '@angular/fire/firestore';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';
import { Service } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceBusinessRulesService
  implements EntityBusinessRules<Service>
{
  private readonly firestore = inject(Firestore);

  async prepareForCreate(service: Service): Promise<Service> {
    const now = new Date();
    service.createdAt = now;
    service.updatedAt = now;
    service.isActive = true;

    this.assertBasicFields(service);
    await this.assertCompanyExists(service.companyId);
    await this.assertServiceLimitNotExceeded(service.companyId);
    await this.assertUniqueName(service);

    return service;
  }

  async prepareForUpdate(
    newValue: Service,
    oldValue: Service
  ): Promise<Service> {
    newValue.updatedAt = new Date();

    if (newValue.companyId !== oldValue.companyId) {
      throw new Error('Não é permitido alterar a empresa do serviço.');
    }

    this.assertBasicFields(newValue);
    await this.assertUniqueName(newValue, newValue.id);

    return newValue;
  }

  private assertBasicFields(service: Service): void {
    if (!service.companyId) {
      throw new Error('Serviço precisa estar vinculado a uma empresa.');
    }

    if (!service.name || service.name.trim() === '') {
      throw new Error('O nome do serviço é obrigatório.');
    }

    if (service.duration <= 0) {
      throw new Error('A duração do serviço deve ser maior que zero.');
    }

    if (service.price < 0) {
      throw new Error('O preço do serviço não pode ser negativo.');
    }
  }

  private async assertCompanyExists(companyId: string): Promise<void> {
    const empresaRef = doc(this.firestore, `empresas/${companyId}`);
    const snap = await getDoc(empresaRef);

    if (!snap.exists()) {
      throw new Error('Empresa vinculada ao serviço não encontrada.');
    }
  }

  private async assertServiceLimitNotExceeded(
    companyId: string
  ): Promise<void> {
    const empresaRef = doc(this.firestore, `empresas/${companyId}`);
    const empresaSnap = await getDoc(empresaRef);

    if (!empresaSnap.exists()) {
      throw new Error('Empresa não encontrada.');
    }

    const empresaData = empresaSnap.data() as { subscriptionPlanId: string };
    const plano = empresaData?.subscriptionPlanId;

    const limites: Record<string, number> = {
      Free: 5,
      Pro: 20,
      Unlimited: Infinity,
    };

    const limite = limites[plano] ?? 5;

    const servicesQuery = query(
      collection(this.firestore, 'services'),
      where('companyId', '==', companyId)
    );

    const servicesSnap = await getDocs(servicesQuery);

    if (servicesSnap.size >= limite) {
      throw new Error(`Limite de serviços atingido para o plano ${plano}.`);
    }
  }

  private async assertUniqueName(
    service: Service,
    excludeId?: string
  ): Promise<void> {
    const servicesQuery = query(
      collection(this.firestore, 'services'),
      where('companyId', '==', service.companyId),
      where('name', '==', service.name.trim())
    );

    const snapshot = await getDocs(servicesQuery);

    if (!snapshot.empty) {
      const exists = snapshot.docs.find((doc) => doc.id !== excludeId);
      if (exists) {
        throw new Error('Já existe um serviço com esse nome nesta empresa.');
      }
    }
  }
}
