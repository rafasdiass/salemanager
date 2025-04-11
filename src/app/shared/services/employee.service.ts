import {
  Injectable,
  signal,
  computed,
  effect,
  WritableSignal,
} from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { AuthenticatedUser } from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';
import { UserBusinessRulesService } from '../regras/user-business-rules.service';
import { AuthService } from './auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends BaseFirestoreCrudService<AuthenticatedUser> {
  private readonly _employees: WritableSignal<AuthenticatedUser[]> = signal([]);
  readonly employees = computed(() => this._employees());

  constructor(
    private readonly rules: UserBusinessRulesService,
    private readonly authService: AuthService
  ) {
    super('employees');
    this.businessRules = this.rules;
    this.initFilteredEmployees();
  }

  private initFilteredEmployees(): void {
    effect(() => {
      const companyId = this.authService.primaryCompanyId();
      const employeeSignal = toSignal(
        this.db
          .collection<AuthenticatedUser>('employees', (ref) =>
            ref
              .where('role', '==', UserRole.employee)
              .where('companyIds', 'array-contains', companyId)
          )
          .valueChanges({ idField: 'id' }),
        { initialValue: [] }
      );

      this._employees.set(employeeSignal());
    });
  }

  override create(user: AuthenticatedUser, id?: string) {
    if (user.role !== UserRole.employee) {
      throw new Error(
        'Este serviço só pode ser utilizado para criar funcionários.'
      );
    }

    if (!user.companyIds?.length) {
      throw new Error('Funcionário precisa estar vinculado a uma empresa.');
    }

    return super.create(user, id);
  }

  override update(id: string, user: AuthenticatedUser) {
    if (user.role !== UserRole.employee) {
      throw new Error('Não é permitido alterar o tipo de usuário FUNCIONÁRIO.');
    }

    return super.update(id, user);
  }
}
