import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  EstablishmentService,
  Establishment,
} from '../../../../shared/services/establishment.service';

@Component({
  selector: 'app-establishments-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './establishments-form.component.html',
  styleUrls: ['./establishments-form.component.scss'],
})
export class EstablishmentsFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly establishmentService = inject(EstablishmentService);

  // Sinais para mensagens de sucesso ou erro.
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Formulário reativo para criação de estabelecimento.
  form = this.fb.group({
    name: this.fb.control('', Validators.required),
    address: this.fb.control('', Validators.required),
    latitude: this.fb.control('', [
      Validators.required,
      Validators.pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/),
    ]),
    longitude: this.fb.control('', [
      Validators.required,
      Validators.pattern(/^[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?|180(\.0+)?$/),
    ]),
    companyId: this.fb.control('', Validators.required),
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;

    const values = this.form.value;
    const newEstablishment: Omit<Establishment, 'id'> = {
      name: values.name as string,
      address: values.address as string,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      companyId: values.companyId as string,
    };

    try {
      const result = await this.establishmentService.createEstablishment(
        newEstablishment
      );
      if (result) {
        this.successMessage.set('Estabelecimento criado com sucesso!');
        this.form.reset();
      } else {
        this.errorMessage.set('Erro ao criar estabelecimento.');
      }
    } catch (error) {
      console.error('Erro ao criar estabelecimento:', error);
      this.errorMessage.set('Erro ao criar estabelecimento.');
    }
  }
}
