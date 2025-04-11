// src/app/shared/services/admin.service.ts

import { Injectable } from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { AuthenticatedUser } from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';
import { UserBusinessRulesService } from '../regras/user-business-rules.service';
import { throwError, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService extends BaseFirestoreCrudService<AuthenticatedUser> {
  constructor(private readonly rules: UserBusinessRulesService) {
    super('admins'); // ou 'empresas/{companyId}/users'
    this.businessRules = this.rules;
  }

  override create(
    user: AuthenticatedUser,
    id?: string
  ): Observable<AuthenticatedUser> {
    if (user.role !== UserRole.ADMIN) {
      throw new Error(
        'Este serviço só pode ser utilizado para criar usuários do tipo ADMIN.'
      );
    }

    if (!user.companyIds || user.companyIds.length === 0) {
      throw new Error(
        'Administrador precisa estar vinculado a uma empresa (companyIds).'
      );
    }

    delete user.couponUsed;
    return super.create(user, id);
  }

  override update(id: string, value: AuthenticatedUser): Observable<string> {
    if (value.role !== UserRole.ADMIN) {
      throw new Error('Não é permitido alterar o tipo de usuário ADMIN.');
    }

    return super.update(id, value);
  }

  override delete(id: string): Observable<string> {
    return throwError(
      () =>
        new Error(
          'A exclusão de administradores não é permitida diretamente. Use desativação lógica.'
        )
    );
  }
}
