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
  doc,
  getDoc,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class EstablishmentBusinessRulesService
  implements EntityBusinessRules<Company>
{
  private readonly firestore = inject(Firestore);

  /**
   * Gatilho antes de criar um novo estabelecimento.
   * - Define timestamps de criação e atualização.
   * - Executa todas as validações de negócio: coordenadas, nome, endereço e localização.
   */
  async prepareForCreate(company: Company): Promise<Company> {
    try {
      const now = new Date();
      company.createdAt = now;
      company.updatedAt = now;

      await this.assertValidCoordinates(company);
      await this.assertUniqueName(company);
      await this.assertUniqueAddress(company);
      await this.assertUniqueLocation(company);

      return company;
    } catch (error) {
      throw new Error(
        `Erro ao preparar criação de estabelecimento: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Gatilho antes de atualizar um estabelecimento existente.
   * - Atualiza o timestamp de atualização.
   * - Não permite mudança de ID nem de ownerId.
   * - Valida novamente as coordenadas.
   */
  async prepareForUpdate(
    newCompany: Company,
    oldCompany: Company
  ): Promise<Company> {
    try {
      newCompany.updatedAt = new Date();

      if (newCompany.id && oldCompany.id && newCompany.id !== oldCompany.id) {
        throw new Error('Não é permitido alterar o ID do estabelecimento.');
      }

      if (newCompany.ownerId !== oldCompany.ownerId) {
        throw new Error(
          'Não é permitido alterar a empresa proprietária do estabelecimento.'
        );
      }

      await this.assertValidCoordinates(newCompany);
      return newCompany;
    } catch (error) {
      throw new Error(
        `Erro ao preparar atualização de estabelecimento: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /** Garante que não haja duplicação de nome */
  private async assertUniqueName(company: Company): Promise<void> {
    const ref = collection(this.firestore, 'empresas');
    const q = query(ref, where('name', '==', company.name));
    const snap = await getDocs(q);

    if (!snap.empty) {
      throw new Error('Já existe uma empresa com este nome.');
    }
  }

  /** Garante que o mesmo endereço não seja usado por outro estabelecimento */
  private async assertUniqueAddress(company: Company): Promise<void> {
    const { address } = company;
    const ref = collection(this.firestore, 'empresas');
    const q = query(
      ref,
      where('address.postal_code', '==', address.postal_code),
      where('address.number', '==', address.number),
      where('address.city', '==', address.city)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      throw new Error('Endereço já está vinculado a outro estabelecimento.');
    }
  }

  /** Garante que as coordenadas geográficas não colidam com outro estabelecimento */
  private async assertUniqueLocation(company: Company): Promise<void> {
    const { location } = company;
    if (!location) return;

    const ref = collection(this.firestore, 'empresas');
    const q = query(
      ref,
      where('location.latitude', '==', location.latitude),
      where('location.longitude', '==', location.longitude)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      throw new Error(
        'Já existe uma empresa cadastrada com estas coordenadas.'
      );
    }
  }

  /** Valida se latitude e longitude estão em faixas aceitáveis */
  private async assertValidCoordinates(company: Company): Promise<void> {
    const { location } = company;
    if (!location) return;

    const isValidLat = location.latitude >= -90 && location.latitude <= 90;
    const isValidLng = location.longitude >= -180 && location.longitude <= 180;

    if (!isValidLat || !isValidLng) {
      throw new Error('Coordenadas geográficas inválidas.');
    }
  }
}
