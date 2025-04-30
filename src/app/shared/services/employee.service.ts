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
import { EmployeeBusinessRulesService } from '../regras/employee-business-rules.service';
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
    private readonly rules: EmployeeBusinessRulesService, // ✅ Agora certo
    private readonly authService: AuthService
  ) {
    super('users'); // ✅ Estamos buscando os employees dentro de 'users'
    this.businessRules = this.rules;
    this.initFilteredEmployees();
  }

  /**
   * Observa a lista de funcionários da empresa logada.
   */
  private initFilteredEmployees(): void {
    effect(() => {
      const companyId = this.authService.user()?.companyId; // ✅ Corrigido

      if (!companyId) {
        this._employees.set([]);
        return;
      }

      this.employeesSub?.unsubscribe();

      const colRef = collection(this.firestore, 'users');
      const q = query(
        colRef,
        where('role', '==', UserRole.employee),
        where('companyId', '==', companyId),
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

  override create(user: AuthenticatedUser, id?: string) {
    if (user.role !== UserRole.employee) {
      throw new Error('Este serviço só pode criar usuários com role EMPLOYEE.');
    }
    if (!user.companyId) {
      throw new Error('Funcionário precisa estar vinculado a uma empresa.');
    }
    return super.create(user, id);
  }

  override update(id: string, user: AuthenticatedUser) {
    if (user.role !== UserRole.employee) {
      throw new Error('Não é permitido alterar o role de um funcionário.');
    }
    return super.update(id, user);
  }

  async terminateEmployee(id: string): Promise<void> {
    const user = await firstValueFrom(this.getById(id));
    if (!user) throw new Error('Funcionário não encontrado.');
    await firstValueFrom(this.update(id, { ...user, is_active: false }));
  }

  async rehireEmployee(id: string): Promise<void> {
    const user = await firstValueFrom(this.getById(id));
    if (!user) throw new Error('Funcionário não encontrado.');
    await firstValueFrom(this.update(id, { ...user, is_active: true }));
  }
}
