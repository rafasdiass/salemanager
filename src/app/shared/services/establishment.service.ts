// src/app/shared/services/establishment.service.ts

import {
  Injectable,
  computed,
  effect,
  signal,
  WritableSignal,
  inject,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  DocumentReference,
  docSnapshots,
} from '@angular/fire/firestore';
import { collection, getDocs } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Company } from '../models/company.model';
import { EstablishmentBusinessRulesService } from '../regras/establishment-business-rules.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EstablishmentService extends BaseFirestoreCrudService<Company> {
  private readonly _company: WritableSignal<Company | null> = signal(null);
  readonly company = computed(() => this._company());

  private companySub?: Subscription;
  private readonly injector = inject(EnvironmentInjector);

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
      this.companySub?.unsubscribe();

      const companyId = this.auth.companyId(); // já corrigido no AuthService
      if (!companyId) {
        this._company.set(null);
        return;
      }

      const snapshots$ = runInInjectionContext(this.injector, () => {
        const ref = doc(
          this.firestore,
          `empresas/${companyId}`
        ) as DocumentReference<Company>;
        return docSnapshots(ref).pipe(
          map((snap) =>
            snap.exists()
              ? ({ ...(snap.data() as Company), id: snap.id } as Company)
              : null
          )
        );
      });

      this.companySub = snapshots$.subscribe({
        next: (company) => this._company.set(company),
        error: () => this._company.set(null),
      });
    });
  }

  async getCurrentCompany(): Promise<Company | null> {
    const companyId = this.auth.companyId();
    if (!companyId) return null;

    const ref = doc(
      this.firestore,
      `empresas/${companyId}`
    ) as DocumentReference<Company>;
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data() as Company;
    return { ...data, id: snap.id };
  }

  async isVipPlan(): Promise<boolean> {
    const company = await this.getCurrentCompany();
    return company?.subscriptionPlanId === 'Unlimited';
  }

  async getCompanyName(): Promise<string | null> {
    const company = await this.getCurrentCompany();
    return company?.name ?? null;
  }
  /**
   * Lista todas as empresas cadastradas no sistema.
   */
  async listAllCompanies(): Promise<Company[]> {
    const colRef = collection(this.firestore, 'empresas');
    const snap = await getDocs(colRef);
    return snap.docs.map((docSnap) => ({
      ...(docSnap.data() as Company),
      id: docSnap.id,
    }));
  }
}
