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
  private firestore = inject(Firestore);

  async prepareForCreate(company: Company): Promise<Company> {
    const now = new Date();
    company.createdAt = now;
    company.updatedAt = now;

    await this.assertValidCoordinates(company);
    await this.assertUniqueName(company);
    await this.assertUniqueAddress(company);
    await this.assertUniqueLocation(company);

    return company;
  }

  async prepareForUpdate(
    newValue: Company,
    oldValue: Company
  ): Promise<Company> {
    newValue.updatedAt = new Date();

    if (newValue.id && oldValue.id && newValue.id !== oldValue.id) {
      throw new Error('Não é permitido alterar o ID do estabelecimento.');
    }

    if (newValue.ownerId !== oldValue.ownerId) {
      throw new Error('Não é permitido alterar a empresa do estabelecimento.');
    }

    await this.assertValidCoordinates(newValue);

    return newValue;
  }

  private async assertUniqueName(company: Company): Promise<void> {
    const ref = collection(this.firestore, 'empresas');
    const q = query(ref, where('name', '==', company.name));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error('Já existe uma empresa com este nome.');
    }
  }

  private async assertUniqueAddress(company: Company): Promise<void> {
    const { address } = company;
    const ref = collection(this.firestore, 'empresas');
    const q = query(
      ref,
      where('address.postal_code', '==', address.postal_code),
      where('address.number', '==', address.number),
      where('address.city', '==', address.city)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error('Endereço já está vinculado a outro estabelecimento.');
    }
  }

  private async assertUniqueLocation(company: Company): Promise<void> {
    const { location } = company;
    if (!location) return;

    const ref = collection(this.firestore, 'empresas');
    const q = query(
      ref,
      where('location.latitude', '==', location.latitude),
      where('location.longitude', '==', location.longitude)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error(
        'Já existe uma empresa cadastrada com estas coordenadas.'
      );
    }
  }

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
