import { Component, inject } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfessionalService } from '../../../../shared/services/employee.service';
import { EmployeeUser } from '../../../../shared/models/models';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profissionais-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  providers: [provideNgxMask()],
  templateUrl: './profissionais-form.component.html',
  styleUrls: ['./profissionais-form.component.scss'],
})
export class ProfissionaisFormComponent {
  private readonly professionalService = inject(ProfessionalService);
  private readonly sanitizer = inject(DomSanitizer);

  // Pré-visualização da imagem (opcional para exibir no UI)
  imagePreviewUrl: string | null = null;
  // Armazena o arquivo selecionado
  selectedImageFile: File | null = null;

  // Formulário com os campos necessários, sem o campo de URL de imagem
  form: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    phone: FormControl<string>;
    birthDate: FormControl<string>;
    commission: FormControl<number>;
    isActive: FormControl<boolean>;
    street: FormControl<string>;
    number: FormControl<string>;
    complement: FormControl<string>;
    neighborhood: FormControl<string>;
    city: FormControl<string>;
    state: FormControl<string>;
    zipCode: FormControl<string>;
    country: FormControl<string>;
  }> = new FormGroup({
    name: new FormControl('', {
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
    phone: new FormControl('', { nonNullable: true }),
    birthDate: new FormControl('', { nonNullable: true }),
    commission: new FormControl(0, { nonNullable: true }),
    isActive: new FormControl(true, { nonNullable: true }),
    street: new FormControl('', { nonNullable: true }),
    number: new FormControl('', { nonNullable: true }),
    complement: new FormControl('', { nonNullable: true }),
    neighborhood: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    state: new FormControl('', { nonNullable: true }),
    zipCode: new FormControl('', { nonNullable: true }),
    country: new FormControl('Brasil', { nonNullable: true }),
  });

  // Submete o formulário para criar o profissional
  async submit(): Promise<void> {
    if (this.form.invalid) return;

    const values = this.form.getRawValue();

    // Cria o objeto profissional com base nas interfaces definidas
    const professional: Omit<EmployeeUser, 'id'> = {
      role: 'employee',
      companyId: '', // Ajuste conforme a lógica de negócio (ex: associar a uma empresa)
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone,
      birthDate: new Date(values.birthDate),
      commission: values.commission,
      isActive: values.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      specialties: [],
      address: {
        street: values.street,
        number: values.number,
        complement: values.complement,
        neighborhood: values.neighborhood,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        country: values.country,
      },
    };

    // Envia os dados do profissional e o arquivo da imagem para o serviço
    await this.professionalService.create(professional, this.selectedImageFile);
    this.resetForm();
  }

  // Reseta o formulário e limpa a pré-visualização e arquivo selecionado
  resetForm(): void {
    this.form.reset();
    this.form.controls.country.setValue('Brasil');
    this.imagePreviewUrl = null;
    this.selectedImageFile = null;
  }

  // Gerencia a seleção da imagem, gera a pré-visualização e armazena o arquivo selecionado
  onImageSelect(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedImageFile = fileInput.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }
}
