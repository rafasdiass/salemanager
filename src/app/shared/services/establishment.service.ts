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
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Company } from '../models/company.model';
import { EstablishmentBusinessRulesService } from '../regras/establishment-business-rules.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EstablishmentService extends BaseFirestoreCrudService<Company> {
  /** Sinal que guarda a empresa atual (ou null) */
  private readonly _company: WritableSignal<Company | null> =
    signal<Company | null>(null);

  /** Exposição pública da empresa atual */
  readonly company = computed(() => this._company());

  /** Para cancelar a assinatura anterior quando mudar de empresa */
  private companySub?: Subscription;

  /** Injector usado para entrar no contexto AngularFire dentro de effects */
  private readonly injector = inject(EnvironmentInjector);

  /**
   * @param rules   — validações de negócio para Company
   * @param auth    — obtém primaryCompanyId()
   *
   * A superclasse já injeta internamente o Firestore via
   * `protected readonly firestore = inject(Firestore)` no BaseFirestoreCrudService.
   */
  constructor(
    private readonly rules: EstablishmentBusinessRulesService,
    private readonly auth: AuthService
  ) {
    super('empresas');
    this.businessRules = this.rules;
    this.initCompanySignal();
  }

  /**
   * Monitora mudanças em `primaryCompanyId` e reage abrindo
   * uma nova assinatura de `docSnapshots`, limpando a anterior.
   * Cada snapshot já traz o `.id` junto com os dados.
   */
  private initCompanySignal(): void {
    effect(() => {
      // cancela assinatura anterior, se houver
      this.companySub?.unsubscribe();
      this.companySub = undefined;

      const companyId = this.auth.primaryCompanyId();
      if (!companyId) {
        this._company.set(null);
        return;
      }

      // dentro do contexto AngularFire, criar o stream de snapshots
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

      // assina e atualiza o sinal
      this.companySub = snapshots$.subscribe({
        next: (company) => this._company.set(company),
        error: () => this._company.set(null),
      });
    });
  }

  /**
   * Busca pontual (Promise) dos dados atuais da empresa.
   * Usamos `getDoc` fora de qualquer `effect`.
   */
  async getCurrentCompany(): Promise<Company | null> {
    const companyId = this.auth.primaryCompanyId();
    if (!companyId) {
      return null;
    }
    const ref = doc(
      this.firestore,
      `empresas/${companyId}`
    ) as DocumentReference<Company>;
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data() as Company;
    return { ...data, id: snap.id };
  }

  /**
   * Checa se o plano atual é o "Unlimited".
   */
  async isVipPlan(): Promise<boolean> {
    const company = await this.getCurrentCompany();
    return company?.subscriptionPlanId === 'Unlimited';
  }

  /**
   * Retorna apenas o nome da empresa atual ou `null`
   */
  async getCompanyName(): Promise<string | null> {
    const company = await this.getCurrentCompany();
    return company?.name ?? null;
  }
}
