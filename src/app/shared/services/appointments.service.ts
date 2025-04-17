// src/app/shared/services/appointments.service.ts

import {
  Injectable,
  signal,
  computed,
  effect,
  WritableSignal,
  inject,
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Appointment } from '../models/appointments.model';
import { AppointmentBusinessRulesService } from '../regras/appointment-business-rules.service';
import { AuthService } from './auth.service';

// RXFire helper for streaming a collection
import { collectionData } from 'rxfire/firestore';
// AngularFire Firestore primitives
import { Firestore, collection, query, where } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AppointmentsService extends BaseFirestoreCrudService<Appointment> {
  private readonly _appointments = signal<Appointment[]>([]);
  readonly loading = signal<boolean>(true);

  readonly appointments = computed(() =>
    this._appointments().filter((a) => a.companyId === this.companyId())
  );
  readonly hasAppointments = computed(() => this.appointments().length > 0);

  private apptsSub?: Subscription;

  // pull primaryCompanyId from the AuthService
  private companyId = computed(() => this.authService.primaryCompanyId());

  constructor(
    private readonly rules: AppointmentBusinessRulesService,
    private readonly authService: AuthService
  ) {
    super('appointments');
    this.businessRules = this.rules;
    this.initAppointments();
  }

  private initAppointments(): void {
    effect(() => {
      // re‑run any time the companyId signal changes:
      const company = this.companyId();
      this.loading.set(true);
      this.apptsSub?.unsubscribe();

      // use the inherited `this.firestore` from BaseFirestoreCrudService
      const colRef = collection(this.firestore, 'appointments');
      const q = query(colRef, where('companyId', '==', company));

      const obs$ = collectionData(q, { idField: 'id' }) as Observable<
        Appointment[]
      >;

      this.apptsSub = obs$.subscribe({
        next: (list) => {
          this._appointments.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[AppointmentsService] erro ao carregar:', err);
          this._appointments.set([]);
          this.loading.set(false);
        },
      });
    });
  }

  /** Helpers unchanged from before */
  getUpcomingAppointments(): Appointment[] {
    const now = Date.now();
    return this.appointments().filter(
      (a) => new Date(a.startTime).getTime() > now
    );
  }

  getPastAppointments(): Appointment[] {
    const now = Date.now();
    return this.appointments().filter(
      (a) => new Date(a.endTime).getTime() < now
    );
  }

  getClientAppointments(clientId: string): Appointment[] {
    return this.appointments().filter((a) => a.clientId === clientId);
  }

  getEmployeeUpcomingAppointments(employeeId: string): Appointment[] {
    const now = Date.now();
    return this.appointments().filter(
      (a) =>
        a.employeeId === employeeId && new Date(a.startTime).getTime() > now
    );
  }

  async cancelAppointment(id: string, reason: string): Promise<void> {
    const appt = await this.getById(id).toPromise();
    if (!appt) throw new Error('Agendamento não encontrado.');
    await this.update(id, {
      ...appt,
      status: 'canceled',
      cancellationReason: reason,
      updatedAt: new Date(),
    }).toPromise();
  }

  async markAsCompleted(id: string): Promise<void> {
    const appt = await this.getById(id).toPromise();
    if (!appt) throw new Error('Agendamento não encontrado.');
    await this.update(id, {
      ...appt,
      status: 'completed',
      updatedAt: new Date(),
    }).toPromise();
  }
}
