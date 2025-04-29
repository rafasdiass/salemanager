import { Component, inject, signal, computed } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeUser } from 'src/app/shared/models/employee.model';
import {  provideNgxMask } from 'ngx-mask';
import { IonicModule } from '@ionic/angular';
import { UserRole } from 'src/app/shared/models/user-role.enum';

@Component({
  selector: 'app-profissionais-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  providers: [provideNgxMask()],
  templateUrl: './profissionais-form.component.html',
  styleUrls: ['./profissionais-form.component.scss'],
})
export class ProfissionaisFormComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);

  /** Formulário reativo */
  form: FormGroup<{
    first_name: FormControl<string>;
    last_name: FormControl<string>;
    cpf: FormControl<string>;
    phone: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
  }> = new FormGroup({
    first_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    last_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cpf: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  /** Carregando durante a submissão */
  readonly isLoading = signal(false);

  /** Erro eventual durante criação */
  readonly errorMessage = signal<string | null>(null);

  /**
   * Submete o formulário para criação do funcionário.
   */
  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const companyId = this.authService.user()?.companyId;
      if (!companyId) {
        throw new Error(
          'Usuário autenticado não está vinculado a uma empresa.'
        );
      }

      const values = this.form.getRawValue();

      const employee: Omit<EmployeeUser, 'id'> = {
        cpf: values.cpf.replace(/\D/g, ''),
        phone: values.phone,
        email: values.email.toLowerCase().trim(),
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        password: values.password,
        role: UserRole.employee,

        companyId,
        is_active: true,
        registration_date: new Date().toISOString(),
      };

      await this.employeeService.create(employee);
      this.resetForm();
    } catch (error: any) {
      console.error('[ProfissionaisForm] Erro ao criar funcionário:', error);
      this.errorMessage.set(error.message || 'Erro desconhecido');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Reseta o formulário e limpa os estados internos.
   */
  resetForm(): void {
    this.form.reset();
    this.isLoading.set(false);
    this.errorMessage.set(null);
  }
}
