// src/app/shared/services/establishment-business-rules.service.ts

import { Injectable, inject } from '@angular/core';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';
import { Company } from '../models/company.model';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class EstablishmentBusinessRulesService
  implements EntityBusinessRules<Company>
{
  private readonly firestore = inject(Firestore);

  /**
   * Gatilho executado antes de criar uma empresa.
   * - Define timestamps de criação e atualização.
   * - Garante que não exista outra empresa com o mesmo nome.
   */
  async prepareForCreate(company: Company): Promise<Company> {
    const now = new Date();
    company.createdAt = now;
    company.updatedAt = now;

    await this.assertUniqueName(company);

    return company;
  }

  /**
   * Gatilho executado antes de atualizar uma empresa existente.
   * - Atualiza o timestamp de modificação.
   * - Impede alteração do ID e do proprietário da empresa.
   */
  async prepareForUpdate(
    newCompany: Company,
    oldCompany: Company
  ): Promise<Company> {
    newCompany.updatedAt = new Date();

    if (newCompany.id && oldCompany.id && newCompany.id !== oldCompany.id) {
      throw new Error('Não é permitido alterar o ID da empresa.');
    }

    if (newCompany.ownerId !== oldCompany.ownerId) {
      throw new Error('Não é permitido alterar o proprietário da empresa.');
    }

    return newCompany;
  }

  /**
   * Valida que o nome da empresa seja único entre todas cadastradas.
   * Útil para evitar conflitos em dashboards e URLs.
   */
  private async assertUniqueName(company: Company): Promise<void> {
    const ref = collection(this.firestore, 'empresas');
    const q = query(ref, where('name', '==', company.name));
    const snap = await getDocs(q);

    if (!snap.empty) {
      throw new Error('Já existe uma empresa cadastrada com este nome.');
    }
  }
}
