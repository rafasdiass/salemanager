// src/app/shared/services/establishment.service.ts

import {
  Injectable,
  computed,
  effect,
  signal,
  WritableSignal,
} from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Company } from '../models/company.model';
import { EstablishmentBusinessRulesService } from '../regras/establishment-business-rules.service';
import { AuthService } from './auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class EstablishmentService extends BaseFirestoreCrudService<Company> {
  private readonly _company: WritableSignal<Company | null> = signal(null);
  readonly company = computed(() => this._company());

  constructor(
    private readonly rules: EstablishmentBusinessRulesService,
    private readonly auth: AuthService
  ) {
    super('empresas');
    this.businessRules = this.rules;
    this.initCompanySignal();
  }

  private initCompanySignal(): void {
    effect(() => {
      const companyId = this.auth.primaryCompanyId();
      if (!companyId) return;

      const companySignal = toSignal(
        this.db
          .doc<Company>(`empresas/${companyId}`)
          .valueChanges({ idField: 'id' }),
        { initialValue: null }
      );

      // 🔥 Corrigido: força o valor como null se for undefined
      this._company.set(companySignal() ?? null);
    });
  }

  /**
   * Retorna uma Promise com os dados da empresa atual do usuário autenticado.
   */
  async getCurrentCompany(): Promise<Company | null> {
    const companyId = this.auth.primaryCompanyId();
    if (!companyId) return null;

    const company = await this.getById(companyId).toPromise();
    return company ?? null; // 🔥 Corrigido
  }

  /**
   * Verifica se a empresa atual é do plano VIP.
   */
  async isVipPlan(): Promise<boolean> {
    const company = await this.getCurrentCompany();
    return company?.subscriptionPlanId === 'Unlimited';
  }

  /**
   * Retorna o nome da empresa atual.
   */
  async getCompanyName(): Promise<string | null> {
    const company = await this.getCurrentCompany();
    return company?.name || null;
  }
}
