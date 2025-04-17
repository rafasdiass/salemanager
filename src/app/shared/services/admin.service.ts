import { Injectable, computed, inject } from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { AuthenticatedUser } from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';
import { UserBusinessRulesService } from '../regras/user-business-rules.service';
import { EmployeeService } from './employee.service';
import { throwError, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService extends BaseFirestoreCrudService<AuthenticatedUser> {
  // Usa o EmployeeService para ter acesso à lista de funcionários filtrados
  private readonly employeeSvc = inject(EmployeeService);

  /** Só funcionários ativos para o dashboard do admin */
  readonly employees = computed(() =>
    this.employeeSvc
      .employees()
      .filter((u) => u.role === UserRole.employee && u.is_active)
  );

  constructor(private readonly rules: UserBusinessRulesService) {
    // Agora aponta para 'users', onde ficam admins e funcionários
    super('users');
    this.businessRules = this.rules;
  }

  override create(
    user: AuthenticatedUser,
    id?: string
  ): Observable<AuthenticatedUser> {
    if (user.role !== UserRole.ADMIN) {
      throw new Error('Só é permitido criar usuários com role ADMIN.');
    }
    if (!user.companyIds?.length) {
      throw new Error('Administrador precisa estar vinculado a uma empresa.');
    }
    // admins não usam cupom
    delete user.couponUsed;
    return super.create(user, id);
  }

  override update(id: string, user: AuthenticatedUser): Observable<string> {
    if (user.role !== UserRole.ADMIN) {
      throw new Error('Role do usuário não pode ser alterada de ADMIN.');
    }
    return super.update(id, user);
  }

  override delete(id: string): Observable<string> {
    return throwError(
      () =>
        new Error(
          'Exclusão direta de administradores não é permitida. Use desativação lógica.'
        )
    );
  }
}
