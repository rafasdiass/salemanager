// src/app/shared/services/employee.service.ts

import {
  Injectable,
  computed,
  effect,
  signal,
  WritableSignal,
  inject,
} from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { AuthenticatedUser } from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';
import { UserBusinessRulesService } from '../regras/user-business-rules.service';
import { AuthService } from './auth.service';
import { Firestore, collection, query, where } from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable, Subscription, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends BaseFirestoreCrudService<AuthenticatedUser> {
  private readonly _employees: WritableSignal<AuthenticatedUser[]> = signal([]);
  readonly employees = computed(() => this._employees());

  private employeesSub?: Subscription;

  constructor(
    private readonly rules: UserBusinessRulesService,
    private readonly authService: AuthService
  ) // usamos o `firestore` herdado de BaseFirestoreCrudService,
  // então não precisamos injetá‑lo aqui de novo
  {
    super('employees');
    this.businessRules = this.rules;
    this.initFilteredEmployees();
  }

  /**
   * Re-subscreve à lista de funcionários ativos
   * sempre que a empresa principal mudar.
   */
  private initFilteredEmployees(): void {
    effect(() => {
      const companyId = this.authService.primaryCompanyId();

      // cancela a assinatura anterior
      this.employeesSub?.unsubscribe();

      // monta a query diretamente sobre this.firestore (herdado)
      const colRef = collection(this.firestore, 'employees');
      const q = query(
        colRef,
        where('role', '==', UserRole.employee),
        where('companyIds', 'array-contains', companyId),
        where('is_active', '==', true)
      );

      const obs$ = collectionData(q, { idField: 'id' }) as Observable<
        AuthenticatedUser[]
      >;

      this.employeesSub = obs$.subscribe({
        next: (emps) => this._employees.set(emps),
        error: (err) => {
          console.error(
            '[EmployeeService] Erro ao carregar funcionários:',
            err
          );
          this._employees.set([]);
        },
      });
    });
  }

  /**
   * Cria um funcionário garantindo role e vínculo corretos.
   */
  override create(user: AuthenticatedUser, id?: string) {
    if (user.role !== UserRole.employee) {
      throw new Error('Este serviço só pode criar usuários com role EMPLOYEE.');
    }
    if (!user.companyIds?.length) {
      throw new Error('Funcionário precisa estar vinculado a uma empresa.');
    }
    return super.create(user, id);
  }

  /**
   * Atualiza um funcionário sem permitir mudar o role.
   */
  override update(id: string, user: AuthenticatedUser) {
    if (user.role !== UserRole.employee) {
      throw new Error('Não é permitido alterar o role de um funcionário.');
    }
    return super.update(id, user);
  }

  /**
   * Marca funcionário como demitido (is_active = false).
   * A UserBusinessRulesService cuidará de setar termination_date.
   */
  async terminateEmployee(id: string): Promise<void> {
    const user = await firstValueFrom(this.getById(id));
    if (!user) throw new Error('Funcionário não encontrado.');
    await firstValueFrom(this.update(id, { ...user, is_active: false }));
  }

  /**
   * Re-contrata funcionário (is_active = true).
   * A UserBusinessRulesService cuidará de limpar termination_date.
   */
  async rehireEmployee(id: string): Promise<void> {
    const user = await firstValueFrom(this.getById(id));
    if (!user) throw new Error('Funcionário não encontrado.');
    await firstValueFrom(this.update(id, { ...user, is_active: true }));
  }
}
