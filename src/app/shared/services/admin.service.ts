// src/app/shared/services/admin.service.ts

import { Injectable, computed, inject } from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { AuthenticatedUser } from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';
import { AdminBusinessRulesService } from '../regras/admin-business-rules.service';
import { EmployeeService } from './employee.service';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService extends BaseFirestoreCrudService<AuthenticatedUser> {
  private readonly employeeService = inject(EmployeeService);

  /** Lista reativa de funcionários ativos da empresa */
  readonly activeEmployees = computed(() =>
    this.employeeService
      .employees()
      .filter((u) => u.role === UserRole.employee && u.is_active)
  );

  constructor(private readonly rules: AdminBusinessRulesService) {
    super('users');
    this.businessRules = this.rules;
  }

  /**
   * Cria um novo administrador.
   * Valida vínculo com empresa e role apropriada.
   */
  override create(
    admin: AuthenticatedUser,
    id?: string
  ): Observable<AuthenticatedUser> {
    if (admin.role !== UserRole.ADMIN) {
      throw new Error('Só é permitido criar usuários com role ADMIN.');
    }

    if (!admin.companyId) {
      throw new Error('Administrador precisa estar vinculado a uma empresa.');
    }

    return super.create(admin, id);
  }

  /**
   * Atualiza dados do admin.
   * Impede troca de role.
   */
  override update(id: string, admin: AuthenticatedUser): Observable<string> {
    if (admin.role !== UserRole.ADMIN) {
      throw new Error('Role do usuário não pode ser alterada de ADMIN.');
    }

    return super.update(id, admin);
  }

  /**
   * Impede exclusão direta do administrador.
   * Recomenda uso de inativação lógica.
   */
  override delete(id: string): Observable<string> {
    return throwError(
      () =>
        new Error(
          'Exclusão direta de administradores não é permitida. Use desativação lógica.'
        )
    );
  }

  /** Lista todos os admins ativos */
  listAdmins(): AuthenticatedUser[] {
    return this.items().filter(
      (user) => user.role === UserRole.ADMIN && user.is_active
    );
  }

  /** Busca o admin principal de uma empresa */
  findAdminByCompany(companyId: string): AuthenticatedUser | undefined {
    return this.items().find(
      (user) => user.role === UserRole.ADMIN && user.companyId === companyId
    );
  }
}
