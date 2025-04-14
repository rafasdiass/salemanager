import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonPopover,
} from '@ionic/angular/standalone';

import {
  getStatusIcon,
  getStatusColor,
} from 'src/app/shared/utils/appointment-status.utils';

import {
  Appointment,
  AppointmentStatus,
} from 'src/app/shared/models/appointments.model';
import { Client } from 'src/app/shared/models/client.model';
import { Service } from 'src/app/shared/models/service.model';
import { AuthenticatedUser } from 'src/app/shared/models/auth.model';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';

@Component({
  selector: 'app-admin-appointments-list',
  templateUrl: './admin-appointments-list.page.html',
  styleUrls: ['./admin-appointments-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonPopover,
  ],
})
export class AdminAppointmentsListPage {
  @Input() appointments: Appointment[] = [];
  @Input() loading = false;
  @Input() clients: Record<string, Client> = {};
  @Input() services: Record<string, Service> = {};
  @Input() employees: Record<string, AuthenticatedUser> = {};

  readonly isProcessing = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  popoverOpen = signal(false);
  popoverEvent = signal<Event | null>(null);
  popoverStatus = signal<AppointmentStatus>('scheduled');

  constructor(private readonly appointmentService: AppointmentsService) {}

  getClientName(id: string): string {
    return this.clients[id]?.name || 'Cliente não encontrado';
  }

  getServiceName(id: string): string {
    return this.services[id]?.name || 'Serviço não encontrado';
  }

  getEmployeeName(id: string): string {
    const emp = this.employees[id];
    return emp?.first_name && emp?.last_name
      ? `${emp.first_name} ${emp.last_name}`
      : emp?.first_name || 'Profissional não encontrado';
  }

  async cancel(id: string): Promise<void> {
    if (!confirm('Cancelar este agendamento?')) return;

    this.isProcessing.set(id);
    try {
      await this.appointmentService.cancelAppointment(
        id,
        'Cancelado pelo admin'
      );
    } catch {
      this.error.set('Erro ao cancelar agendamento.');
    } finally {
      this.isProcessing.set(null);
    }
  }

  async complete(id: string): Promise<void> {
    this.isProcessing.set(id);
    try {
      await this.appointmentService.markAsCompleted(id);
    } catch {
      this.error.set('Erro ao concluir agendamento.');
    } finally {
      this.isProcessing.set(null);
    }
  }

  openPopover(event: Event, status: AppointmentStatus): void {
    this.popoverEvent.set(event);
    this.popoverStatus.set(status);
    this.popoverOpen.set(true);
  }

  getIcon(status: AppointmentStatus): string {
    return getStatusIcon(status);
  }

  getColor(status: AppointmentStatus): string {
    return getStatusColor(status);
  }
}
