import { Injectable, signal } from '@angular/core';
import {
  Appointment,
  AppointmentStatus,
} from 'src/app/shared/models/appointments.model';
import { Client } from 'src/app/shared/models/client.model';

@Injectable({ providedIn: 'root' })
export class AdminAppointmentsFilterService {
  readonly selectedStatus = signal<AppointmentStatus | 'all'>('all');
  readonly searchTerm = signal('');
  readonly startDate = signal(
    new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
  );
  readonly endDate = signal(
    new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
  );
  readonly error = signal<string | null>(null);

  /**
   * Filtra os agendamentos com base nos critérios de status, data e nome do cliente.
   * @param appointments Lista de agendamentos
   * @param clientMap Mapa com dados reais dos clientes
   */
  filter(
    appointments: Appointment[],
    clientMap: Record<string, Client>
  ): Appointment[] {
    const status = this.selectedStatus();
    const term = this.searchTerm().toLowerCase();
    const start = new Date(this.startDate());
    const end = new Date(this.endDate());

    try {
      return appointments.filter((appt) => {
        const byStatus = status === 'all' || appt.status === status;
        const inDateRange =
          new Date(appt.startTime) >= start && new Date(appt.startTime) <= end;

        const client = clientMap[appt.clientId];
        const name = client?.name?.toLowerCase() ?? '';
        const matchesSearch = !term || name.includes(term);

        return byStatus && inDateRange && matchesSearch;
      });
    } catch (e) {
      console.error('[AdminAppointmentsFilterService] Erro no filtro:', e);
      this.error.set('Erro ao filtrar os agendamentos.');
      return [];
    }
  }

  reset(): void {
    this.selectedStatus.set('all');
    this.searchTerm.set('');
    const today = new Date();
    this.startDate.set(new Date(today.setHours(0, 0, 0, 0)).toISOString());
    this.endDate.set(new Date(today.setHours(23, 59, 59, 999)).toISOString());
    this.error.set(null);
  }
}
