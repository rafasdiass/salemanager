import {
  Injectable,
  computed,
  effect,
  signal,
  WritableSignal,
} from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Service } from '../models/service.model';
import { ServiceBusinessRulesService } from '../regras/service-business-rules.service';
import { AuthService } from './auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class ServicesService extends BaseFirestoreCrudService<Service> {
  private readonly _services: WritableSignal<Service[]> = signal([]);
  readonly services = computed(() => this._services());

  /** Serviços ativos somente */
  readonly activeServices = computed(() =>
    this.services().filter((s) => s.isActive)
  );

  /** Apenas os nomes dos serviços, útil para dropdowns */
  readonly serviceNames = computed(() =>
    this.activeServices().map((s) => s.name)
  );

  constructor(
    private readonly rules: ServiceBusinessRulesService,
    private readonly authService: AuthService
  ) {
    super('services');
    this.businessRules = this.rules;
    this.initFilteredServices();
  }

  /**
   * Inicializa a lista de serviços filtrada por empresa vinculada ao usuário.
   */
  private initFilteredServices(): void {
    effect(() => {
      const companyId = this.authService.primaryCompanyId();

      const servicesSignal = toSignal(
        this.db
          .collection<Service>('services', (ref) =>
            ref.where('companyId', '==', companyId)
          )
          .valueChanges({ idField: 'id' }),
        { initialValue: [] }
      );

      this._services.set(servicesSignal());
    });
  }

  /**
   * Busca um serviço pelo ID diretamente do sinal reativo.
   */
  getByIdFromSignal(serviceId: string): Service | undefined {
    return this.services().find((s) => s.id === serviceId);
  }

  /**
   * Retorna todos os serviços oferecidos por um profissional específico (caso associe IDs).
   */
  getByProfessional(professionalId: string): Service[] {
    return this.activeServices().filter((s) =>
      s.professionalsIds?.includes(professionalId)
    );
  }

  /**
   * Retorna os serviços de uma determinada categoria.
   */
  getByCategory(categoryId: string): Service[] {
    return this.activeServices().filter((s) => s.categoryId === categoryId);
  }
}
