import { Component, inject } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientService } from 'src/app/shared/services/client.service';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { IonicModule } from '@ionic/angular';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-clients-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  providers: [provideNgxMask()],
  templateUrl: './clients-form.component.html',
  styleUrls: ['./clients-form.component.scss'],
})
export class ClientsFormComponent {
  private readonly clientService = inject(ClientService);
  private readonly authService = inject(AuthService);

  form: FormGroup<{
    nome: FormControl<string>;
    telefone: FormControl<string>;
    email: FormControl<string>;
    documento: FormControl<string>;
    endereco: FormGroup<{
      street: FormControl<string>;
      number: FormControl<string>;
      complement: FormControl<string>;
      neighborhood: FormControl<string>;
      city: FormControl<string>;
      state: FormControl<string>;
      postal_code: FormControl<string>;
      country: FormControl<string>;
    }>;
    observacoes: FormControl<string>;
  }> = new FormGroup({
    nome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    telefone: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/), // formato brasileiro
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    documento: new FormControl('', { nonNullable: true }),
    endereco: new FormGroup({
      street: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      number: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      complement: new FormControl('', { nonNullable: true }),
      neighborhood: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      city: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      state: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      postal_code: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      country: new FormControl('Brasil', { nonNullable: true }),
    }),
    observacoes: new FormControl('', { nonNullable: true }),
  });

  /**
   * Submete o formulário e cria o cliente
   */
  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Preencha corretamente todos os campos obrigatórios.');
      return;
    }

    try {
      const companyId = this.authService.user()?.companyId;
      if (!companyId) {
        throw new Error('Usuário não está vinculado a uma empresa.');
      }

      const raw = this.form.getRawValue();

      const cliente: Cliente = {
        nome: raw.nome.trim(),
        telefone: raw.telefone.replace(/\D/g, ''),
        email: raw.email.trim().toLowerCase(),
        documento: raw.documento.replace(/\D/g, ''),
        endereco: {
          street: raw.endereco.street.trim(),
          number: raw.endereco.number.trim(),
          complement: raw.endereco.complement?.trim() || '',
          neighborhood: raw.endereco.neighborhood.trim(),
          city: raw.endereco.city.trim(),
          state: raw.endereco.state.trim(),
          postal_code: raw.endereco.postal_code.replace(/\D/g, ''),
          country: raw.endereco.country.trim(),
        },
        observacoes: raw.observacoes.trim(),
        companyId: companyId,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.clientService.create(cliente);
      this.resetForm();
    } catch (error: any) {
      console.error('[ClientsFormComponent] Erro ao criar cliente:', error);
      alert(error.message || 'Erro desconhecido ao criar cliente.');
    }
  }

  /**
   * Reseta o formulário.
   */
  resetForm(): void {
    this.form.reset();
    this.form.controls.endereco.controls.country.setValue('Brasil');
  }
}
