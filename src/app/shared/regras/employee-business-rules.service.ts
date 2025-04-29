// src/app/shared/regras/employee-business-rules.service.ts

import { Injectable } from '@angular/core';
import { EntityBusinessRules } from '../services/base-firestore-crud.service';
import { AuthenticatedUser } from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';

@Injectable({ providedIn: 'root' })
export class EmployeeBusinessRulesService
  implements EntityBusinessRules<AuthenticatedUser>
{
  constructor() {}

  async prepareForCreate(user: AuthenticatedUser): Promise<AuthenticatedUser> {
    const now = new Date();

    if (user.role !== UserRole.employee) { 
      throw new Error('Role inválido para funcionário.');
    }

    user.createdAt = now;
    user.updatedAt = now;
    user.is_active = true;
    user.termination_date = undefined;

    return user;
  }

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
}
