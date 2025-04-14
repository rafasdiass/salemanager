import {
  Component,
  Input,
  computed,
  signal,
  inject,
  effect,
} from '@angular/core';
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

import { Appointment } from 'src/app/shared/models/appointments.model';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ServicesService } from 'src/app/shared/services/services.service';
import { ClientService } from 'src/app/shared/services/clients.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';

import { Client } from 'src/app/shared/models/client.model';
import { Service } from 'src/app/shared/models/service.model';
import { AuthenticatedUser } from 'src/app/shared/models/auth.model';

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

  private readonly appointmentService = inject(AppointmentsService);
  private readonly clientService = inject(ClientService);
  private readonly serviceService = inject(ServicesService);
  private readonly employeeService = inject(EmployeeService);

  readonly isProcessing = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly clientMap = signal<Record<string, Client>>({});
  readonly serviceMap = signal<Record<string, Service>>({});
  readonly employeeMap = signal<Record<string, AuthenticatedUser>>({});

  // Popover
  popoverOpen = signal(false);
  popoverEvent = signal<Event | null>(null);
  popoverStatus = signal<string>('scheduled');

  constructor() {
    this.loadEntities();
  }

  private async loadEntities(): Promise<void> {
    try {
      const [clients, services, employees] = await Promise.all([
        this.clientService.listAll().toPromise(),
        this.serviceService.listAll().toPromise(),
        this.employeeService.listAll().toPromise(),
      ]);

      this.clientMap.set(
        Object.fromEntries((clients ?? []).map((c) => [c.id!, c]))
      );
      this.serviceMap.set(
        Object.fromEntries((services ?? []).map((s) => [s.id!, s]))
      );
      this.employeeMap.set(
        Object.fromEntries((employees ?? []).map((e) => [e.id!, e]))
      );
    } catch (err: any) {
      this.error.set('Erro ao carregar dados dos agendamentos.');
      console.error('[AdminAppointmentsListPage] Erro:', err);
    }
  }

  getClientName(id: string): string {
    const client = this.clientMap()[id];
    return client?.name || 'Cliente não encontrado';
  }

  getServiceName(id: string): string {
    const service = this.serviceMap()[id];
    return service?.name || 'Serviço não encontrado';
  }

  getEmployeeName(id: string): string {
    const emp = this.employeeMap()[id];
    const fullName =
      emp?.first_name && emp?.last_name
        ? `${emp.first_name} ${emp.last_name}`
        : emp?.first_name || 'Profissional não encontrado';
    return fullName;
  }

  async cancel(id: string): Promise<void> {
    const confirmed = confirm('Cancelar este agendamento?');
    if (!confirmed) return;

    this.isProcessing.set(id);
    try {
      await this.appointmentService.cancelAppointment(
        id,
        'Cancelado pelo admin'
      );
    } catch (e) {
      this.error.set('Erro ao cancelar o agendamento.');
    } finally {
      this.isProcessing.set(null);
    }
  }

  async complete(id: string): Promise<void> {
    this.isProcessing.set(id);
    try {
      await this.appointmentService.markAsCompleted(id);
    } catch (e) {
      this.error.set('Erro ao concluir o agendamento.');
    } finally {
      this.isProcessing.set(null);
    }
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'time-outline',
      confirmed: 'checkmark',
      completed: 'checkmark-circle',
      canceled: 'close-circle',
      'no-show': 'alert-circle',
      rescheduled: 'refresh-circle',
    };
    return map[status] || 'help';
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'medium',
      confirmed: 'success',
      completed: 'success',
      canceled: 'danger',
      'no-show': 'warning',
      rescheduled: 'tertiary',
    };
    return map[status] || 'dark';
  }

  openPopover(event: Event, status: string): void {
    this.popoverEvent.set(event);
    this.popoverStatus.set(status);
    this.popoverOpen.set(true);
  }
}
