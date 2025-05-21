import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { Company } from '../../../../shared/models/company.model';
import { Address } from '../../../../shared/models/address.model';
import { EstablishmentService } from '../../../../shared/services/establishment.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-establishments-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './establishments-form.component.html',
  styleUrls: ['./establishments-form.component.scss'],
})
export class EstablishmentsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly establishmentService = inject(EstablishmentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  isEditMode = false;
  companyId: string | null = null;

  form = this.fb.group({
    name: this.fb.control('', Validators.required),
    cnpj: this.fb.control(''),
    email: this.fb.control(''),
    phone: this.fb.control(''),
    address: this.fb.group({
      street: this.fb.control('', Validators.required),
      number: this.fb.control('', Validators.required),
      neighborhood: this.fb.control('', Validators.required),
      city: this.fb.control('', Validators.required),
      state: this.fb.control('', Validators.required),
      postal_code: this.fb.control('', Validators.required),
      country: this.fb.control('Brasil', Validators.required),
    }),
    subscriptionPlanId: this.fb.control('Free', Validators.required),
    ownerId: this.fb.control(''),
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.companyId = params.get('id');
      this.isEditMode = !!this.companyId;

      // Preenche ownerId com usuário logado (admin da empresa)
      const userId = this.authService.user()?.id || '';
      this.form.patchValue({ ownerId: userId });

      if (this.isEditMode && this.companyId) {
        try {
          // Corrige aqui usando firstValueFrom!
          const company: Company = await firstValueFrom(
            this.establishmentService.getById(this.companyId)
          );
          if (company) {
            const safeAddress: Address = {
              street: company.address?.street || '',
              number: company.address?.number || '',
              neighborhood: company.address?.neighborhood || '',
              city: company.address?.city || '',
              state: company.address?.state || '',
              postal_code: company.address?.postal_code || '',
              country: company.address?.country || 'Brasil',
            };
            this.form.patchValue({
              name: company.name || '',
              cnpj: company.cnpj || '',
              email: company.email || '',
              phone: company.phone || '',
              address: safeAddress,
              subscriptionPlanId: company.subscriptionPlanId || 'Free',
              ownerId: company.ownerId || userId,
            });
          }
        } catch (err) {
          this.errorMessage.set('Erro ao carregar dados da empresa.');
        }
      }
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set(
        'Preencha corretamente todos os campos obrigatórios.'
      );
      return;
    }

    const values = this.form.value;
    const address: Address = {
      street: values.address?.street || '',
      number: values.address?.number || '',
      neighborhood: values.address?.neighborhood || '',
      city: values.address?.city || '',
      state: values.address?.state || '',
      postal_code: values.address?.postal_code || '',
      country: values.address?.country || 'Brasil',
    };

    const payload: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
      name: values.name || '',
      cnpj: values.cnpj || '',
      email: values.email || '',
      phone: values.phone || '',
      address: address,
      subscriptionPlanId: values.subscriptionPlanId as any,
      ownerId: values.ownerId || '',
    };

    try {
      if (this.isEditMode && this.companyId) {
        await this.establishmentService.update(this.companyId, payload);
        this.successMessage.set('Estabelecimento atualizado com sucesso!');
      } else {
        await this.establishmentService.create(payload);
        this.successMessage.set('Estabelecimento criado com sucesso!');
        this.form.reset();
      }
      setTimeout(() => this.router.navigate(['/admin/estabelecimentos']), 1100);
    } catch (error) {
      console.error('Erro ao salvar estabelecimento:', error);
      this.errorMessage.set('Erro ao salvar estabelecimento.');
    }
  }
  // ...ou ainda melhor:
  onCancel() {
    this.router.navigate(['/admin/estabelecimentos']);
  }
}
