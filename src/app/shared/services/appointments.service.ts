import { Injectable, computed, effect, signal } from '@angular/core';
import { BaseFirestoreCrudService } from './base-firestore-crud.service';
import { Appointment } from '../models/appointments.model';
import { AppointmentBusinessRulesService } from '../regras/appointment-business-rules.service';
import { AuthService } from './auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentsService extends BaseFirestoreCrudService<Appointment> {
  private readonly companyId = this.authService.primaryCompanyId;
  private readonly _appointments = signal<Appointment[]>([]);

  readonly loading = signal<boolean>(true); // ✅ agora disponível!
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
    this.initializeFilteredList();
  }

  private initializeFilteredList(): void {
    effect(() => {
      this.loading.set(true);
      const signal$ = toSignal(this.listAll(), { initialValue: [] });
      this._appointments.set(signal$());
      this.loading.set(false);
    });
  }

  /**
   * Retorna todos os agendamentos futuros da empresa atual.
   */
  getUpcomingAppointments(): Appointment[] {
    const now = new Date();
    return this.appointments().filter((a) => new Date(a.startTime) > now);
  }

  /**
   * Retorna os agendamentos passados (para histórico).
   */
  getPastAppointments(): Appointment[] {
    const now = new Date();
    return this.appointments().filter((a) => new Date(a.endTime) < now);
  }

  /**
   * Retorna os agendamentos ativos de um cliente específico.
   */
  getClientAppointments(clientId: string): Appointment[] {
    return this.appointments().filter((a) => a.clientId === clientId);
  }

  /**
   * Retorna os agendamentos futuros de um funcionário específico.
   */
  getEmployeeUpcomingAppointments(employeeId: string): Appointment[] {
    const now = new Date();
    return this.appointments().filter(
      (a) => a.employeeId === employeeId && new Date(a.startTime) > now
    );
  }

  /**
   * Cancela um agendamento com justificativa.
   */
  async cancelAppointment(id: string, reason: string): Promise<void> {
    const appointment = await this.getById(id).toPromise();
    if (!appointment) throw new Error('Agendamento não encontrado.');

    const update: Appointment = {
      ...appointment,
      status: 'canceled',
      cancellationReason: reason,
      updatedAt: new Date(),
    };

    await this.update(id, update).toPromise();
  }

  /**
   * Marca um agendamento como concluído.
   */
  async markAsCompleted(id: string): Promise<void> {
    const appointment = await this.getById(id).toPromise();
    if (!appointment) throw new Error('Agendamento não encontrado.');

    const update: Appointment = {
      ...appointment,
      status: 'completed',
      updatedAt: new Date(),
    };

    await this.update(id, update).toPromise();
  }
}
