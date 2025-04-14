import { Injectable, computed, effect, signal } from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Appointment } from '../models/appointments.model';
import { AppointmentBusinessRulesService } from '../regras/appointment-business-rules.service';
import { AuthService } from './auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AppointmentsService extends BaseFirestoreCrudService<Appointment> {
  private readonly _appointments = signal<Appointment[]>([]);
  readonly loading = signal<boolean>(true);
  readonly appointments = computed(() =>
    this._appointments().filter((a) => a.companyId === this.companyId())
  );
  readonly hasAppointments = computed(() => this.appointments().length > 0);

  constructor(
    private readonly rules: AppointmentBusinessRulesService,
    private readonly authService: AuthService
  ) {
    super('appointments');
    this.businessRules = this.rules;
    this.loadAppointments();
  }

  private companyId = computed(() => this.authService.primaryCompanyId());

  private loadAppointments(): void {
    effect(() => {
      this.loading.set(true);
      const all$ = toSignal(this.listAll(), { initialValue: [] });
      this._appointments.set(all$());
      this.loading.set(false);
    });
  }

  getUpcomingAppointments(): Appointment[] {
    const now = new Date();
    return this.appointments().filter((a) => new Date(a.startTime) > now);
  }

  getPastAppointments(): Appointment[] {
    const now = new Date();
    return this.appointments().filter((a) => new Date(a.endTime) < now);
  }

  getClientAppointments(clientId: string): Appointment[] {
    return this.appointments().filter((a) => a.clientId === clientId);
  }

  getEmployeeUpcomingAppointments(employeeId: string): Appointment[] {
    const now = new Date();
    return this.appointments().filter(
      (a) => a.employeeId === employeeId && new Date(a.startTime) > now
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
