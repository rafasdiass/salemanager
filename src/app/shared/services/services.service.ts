// src/app/shared/services/services.service.ts

import {
  Injectable,
  signal,
  computed,
  effect,
  WritableSignal,
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Service } from '../models/service.model';
import { ServiceBusinessRulesService } from '../regras/service-business-rules.service';
import { AuthService } from './auth.service';

// rxfire import (not @angular/fire)
import { collectionData } from 'rxfire/firestore';
// angular/fire imports
import { collection, query, where } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ServicesService extends BaseFirestoreCrudService<Service> {
  private readonly _services: WritableSignal<Service[]> = signal([]);
  readonly services = computed(() => this._services());
  readonly activeServices = computed(() =>
    this.services().filter((s) => s.isActive)
  );
  readonly serviceNames = computed(() =>
    this.activeServices().map((s) => s.name)
  );

  private servicesSub?: Subscription;

  constructor(
    private readonly rules: ServiceBusinessRulesService,
    private readonly authService: AuthService
  ) {
    super('services');
    this.businessRules = this.rules;
    this.initFilteredServices();
  }

  private initFilteredServices(): void {
    effect(() => {
      // 1) whenever the primary company changes...
      const companyId = this.authService.primaryCompanyId();

      // 2) tear down previous subscription
      this.servicesSub?.unsubscribe();

      // 3) build a Firestore query for just this company
      const colRef = collection(this.firestore, 'services');
      const q = query(colRef, where('companyId', '==', companyId));

      // 4) use rxfire's collectionData (typed via a cast)
      const obs$ = collectionData(q, { idField: 'id' }) as Observable<
        Service[]
      >;

      // 5) subscribe and push into our signal
      this.servicesSub = obs$.subscribe({
        next: (services) => this._services.set(services),
        error: (err) => {
          console.error('[ServicesService] Erro ao carregar serviços:', err);
          this._services.set([]);
        },
      });
    });
  }

  /**
   * Retorna um serviço diretamente do último valor carregado
   */
  getByIdFromSignal(serviceId: string): Service | undefined {
    return this.services().find((s) => s.id === serviceId);
  }

  /**
   * Todos os serviços que este profissional oferece
   */
  getByProfessional(professionalId: string): Service[] {
    return this.activeServices().filter((s) =>
      s.professionalsIds?.includes(professionalId)
    );
  }

  /**
   * Serviços de uma categoria específica
   */
  getByCategory(categoryId: string): Service[] {
    return this.activeServices().filter((s) => s.categoryId === categoryId);
  }
}
