// src/app/features/users/user-business-rules.service.ts

import { Injectable, inject } from '@angular/core';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';
import { AuthenticatedUser } from '../models/auth.model';
import { Company } from '../models/company.model';
import { UserRole } from '../models/user-role.enum';
import { getPrimaryCompanyId } from '../utils/get-primary-company-id.util';
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
export class UserBusinessRulesService
  implements EntityBusinessRules<AuthenticatedUser>
{
  private firestore = inject(Firestore);

  async prepareForCreate(user: AuthenticatedUser): Promise<AuthenticatedUser> {
    try {
      const now = new Date();

      user.createdAt = now;
      user.updatedAt = now;
      user.is_active = true;

      const companyId = getPrimaryCompanyId(user);

      switch (user.role) {
        case UserRole.ADMIN:
          await this.assertSingleAdmin(companyId);
          delete user.couponUsed;
          break;

        case UserRole.employee:
          user.role = UserRole.employee;
          break;

        case UserRole.client:
          user.couponUsed = user.couponUsed || now.toISOString();
          await this.assertNoDuplicateClient(user.email, companyId);
          await this.assertClientLimit(companyId);
          break;

        default:
          throw new Error(`Tipo de usuário inválido: ${user.role}`);
      }

      return user;
    } catch (error) {
      throw new Error(
        `Erro ao preparar criação de usuário: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async prepareForUpdate(
    newUser: AuthenticatedUser,
    oldUser: AuthenticatedUser
  ): Promise<AuthenticatedUser> {
    try {
      newUser.updatedAt = new Date();

      if (newUser.role !== oldUser.role) {
        throw new Error('Não é permitido alterar o tipo de usuário.');
      }

      return newUser;
    } catch (error) {
      throw new Error(
        `Erro ao preparar atualização de usuário: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async assertSingleAdmin(companyId: string): Promise<void> {
    const ref = collection(this.firestore, `empresas/${companyId}/users`);
    const q = query(ref, where('role', '==', UserRole.ADMIN));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error('Já existe um administrador neste estabelecimento.');
    }
  }

  private async assertNoDuplicateClient(
    email: string,
    companyId: string
  ): Promise<void> {
    const ref = collection(this.firestore, `empresas/${companyId}/users`);
    const q = query(
      ref,
      where('email', '==', email),
      where('role', '==', UserRole.client)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error('Este cliente já está cadastrado neste estabelecimento.');
    }
  }

  private async assertClientLimit(companyId: string): Promise<void> {
    const empresaRef = doc(this.firestore, `empresas/${companyId}`);
    const empresaSnap = await getDoc(empresaRef);

    if (!empresaSnap.exists()) {
      throw new Error('Estabelecimento não encontrado.');
    }

    const empresaData = empresaSnap.data() as Company;
    const plano = empresaData.subscriptionPlanId;
    const limites: Record<Company['subscriptionPlanId'], number> = {
      Free: 10,
      Pro: 30,
      Unlimited: Infinity,
    };

    const limite = limites[plano] ?? 10;

    const usersRef = collection(this.firestore, `empresas/${companyId}/users`);
    const q = query(
      usersRef,
      where('role', '==', UserRole.client),
      where('is_active', '==', true)
    );
    const snapshot = await getDocs(q);

    const totalAtivos = snapshot.size || 0;

    if (totalAtivos >= limite) {
      throw new Error(
        `Limite de clientes ativos atingido para o plano ${plano}.`
      );
    }
  }
}
