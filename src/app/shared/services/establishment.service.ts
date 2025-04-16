import {
  Injectable,
  computed,
  effect,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  getDoc,
  DocumentReference,
  DocumentData,
} from '@angular/fire/firestore';
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

      const companyDocRef: DocumentReference<Company> = doc(
        this.firestore,
        `empresas/${companyId}`
      ) as DocumentReference<Company>;

      const companySignal = toSignal(docData<Company>(companyDocRef), {
        initialValue: null,
      });

      this._company.set(companySignal() ?? null);
    });
  }

  /**
   * Retorna uma Promise com os dados da empresa atual do usuário autenticado.
   */
  async getCurrentCompany(): Promise<Company | null> {
    const companyId = this.auth.primaryCompanyId();
    if (!companyId) return null;

    const companyDocRef = doc(
      this.firestore,
      `empresas/${companyId}`
    ) as DocumentReference<Company>;

    const snapshot = await getDoc(companyDocRef);
    const data = snapshot.data();
    return data ?? null;
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
    return company?.name ?? null;
  }
}
