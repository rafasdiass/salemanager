// src/app/shared/regras/admin-business-rules.service.ts

import { Injectable, inject } from '@angular/core';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';
import { AuthenticatedUser } from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AdminBusinessRulesService
  implements EntityBusinessRules<AuthenticatedUser>
{
  private readonly firestore = inject(Firestore);

  /**
   * Executado antes de criar um ADMIN.
   * - Define timestamps.
   * - Marca como ativo.
   * - Garante que só exista um ADMIN por empresa.
   */
  async prepareForCreate(user: AuthenticatedUser): Promise<AuthenticatedUser> {
    const now = new Date();

    user.createdAt = now;
    user.updatedAt = now;
    user.is_active = true;
    user.termination_date = undefined;

    if (user.role !== UserRole.ADMIN) {
      throw new Error('Role inválido para criação de admin.');
    }

    await this.assertSingleAdmin(user.companyId);

    return user;
  }

  /**
   * Executado antes de atualizar um ADMIN.
   * - Atualiza timestamp.
   * - Impede troca de role.
   * - Trata desligamento e recontratação.
   */
  async prepareForUpdate(
    newUser: AuthenticatedUser,
    oldUser: AuthenticatedUser
  ): Promise<AuthenticatedUser> {
    const now = new Date();
    newUser.updatedAt = now;

    if (newUser.role !== oldUser.role) {
      throw new Error('Não é permitido alterar o tipo de usuário.');
    }

    if (oldUser.is_active && newUser.is_active === false) {
      newUser.termination_date = newUser.termination_date || now.toISOString();
    }

    if (!oldUser.is_active && newUser.is_active === true) {
      newUser.termination_date = undefined;
    }

    return newUser;
  }

  /**
   * Valida que não exista mais de um admin por empresa.
   */
  private async assertSingleAdmin(companyId: string): Promise<void> {
    const ref = collection(this.firestore, `empresas/${companyId}/users`);
    const q = query(ref, where('role', '==', UserRole.ADMIN));
    const snap = await getDocs(q);

    if (!snap.empty) {
      throw new Error('Já existe um administrador nesta empresa.');
    }
  }
}
