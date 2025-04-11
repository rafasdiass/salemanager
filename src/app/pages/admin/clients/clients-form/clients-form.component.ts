import { Component, inject } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientsService } from '../../../../shared/services/clients.service';
import { ClientUser } from '../../../../shared/models/models';

@Component({
  selector: 'app-clients-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients-form.component.html',
  styleUrls: ['./clients-form.component.scss'],
})
export class ClientsFormComponent {
  private readonly clientsService = inject(ClientsService);

  form: FormGroup<{
    name: FormControl<string>;
    phone: FormControl<string>;
    email: FormControl<string>;
    birthDate: FormControl<string>;
    notes: FormControl<string>;
    address: FormGroup<{
      street: FormControl<string>;
      number: FormControl<string>;
      complement: FormControl<string>;
      neighborhood: FormControl<string>;
      city: FormControl<string>;
      state: FormControl<string>;
      zipCode: FormControl<string>;
      country: FormControl<string>;
    }>;
  }> = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/), // Exemplo: (99) 99999-9999
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    birthDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notes: new FormControl('', { nonNullable: true }),
    address: new FormGroup({
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
      zipCode: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      country: new FormControl('Brasil', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    }),
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      alert('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    const raw = this.form.getRawValue();
    const birthDate = this.toValidDate(raw.birthDate);

    if (!birthDate) {
      alert('Data de nascimento inválida. Corrija e tente novamente.');
      return;
    }

    const client: Omit<ClientUser, 'id'> = {
      role: 'client',
      name: raw.name.trim(),
      phone: raw.phone.trim(),
      email: raw.email.trim(),
      birthDate,
     
      createdAt: new Date(),
      updatedAt: new Date(),
      address: {
        street: raw.address.street.trim(),
        number: raw.address.number.trim(),
        complement: raw.address.complement.trim(),
        neighborhood: raw.address.neighborhood.trim(),
        city: raw.address.city.trim(),
        state: raw.address.state.trim(),
        zipCode: raw.address.zipCode.trim(),
        country: raw.address.country.trim(),
      },
    };

    try {
      await this.clientsService.create(client);
      this.form.reset();
    } catch (error) {
      console.error('[ClientsForm] Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Tente novamente mais tarde.');
    }
  }

  private toValidDate(input: string): Date | undefined {
    if (!input || typeof input !== 'string') return undefined;
    const date = new Date(input);
    return isNaN(date.getTime()) ? undefined : date;
  }
}
