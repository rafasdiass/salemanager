import {
  Injectable,
  signal,
  computed,
  WritableSignal,
  effect,
} from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { SubscriptionPlan } from '../models/company.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class SubscriptionPlanService extends BaseFirestoreCrudService<SubscriptionPlan> {
  private readonly _plans: WritableSignal<SubscriptionPlan[]> = signal([]);
  readonly plans = computed(() => this._plans());
  readonly hasPlans = computed(() => this._plans().length > 0);

  constructor() {
    super('subscriptionPlans');
    this.initPlansSignal();
  }

  private initPlansSignal(): void {
    effect(() => {
      const plansSignal = toSignal(this.listAll(), { initialValue: [] });
      this._plans.set(plansSignal());
    });
  }

  /**
   * Busca um plano específico pelo ID dentro do signal reativo.
   */
  getByIdFromSignal(id: string): SubscriptionPlan | undefined {
    return this.plans().find((plan) => plan.id === id);
  }

  /**
   * Retorna todos os planos com preço igual a 0 (gratuitos).
   */
  getFreePlans(): SubscriptionPlan[] {
    return this.plans().filter((plan) => plan.price === 0);
  }

  /**
   * Retorna todos os planos pagos.
   */
  getPaidPlans(): SubscriptionPlan[] {
    return this.plans().filter((plan) => plan.price > 0);
  }
}
