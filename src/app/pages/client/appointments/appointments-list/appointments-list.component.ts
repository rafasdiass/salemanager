import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../../../shared/models/models';
import { AppointmentService } from '../../../../shared/services/appointments.service';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments-list.component.html',
  styleUrls: ['./appointments-list.component.scss'],
})
export class AppointmentsListComponent {
  private readonly appointmentService = inject(AppointmentService);

  readonly appointments = this.appointmentService.appointments;
  readonly loading = this.appointmentService.loading;
  readonly error = this.appointmentService.error;

  // Verifica se não há agendamentos e não está em carregamento
  readonly hasNoAppointments = computed(
    () => !this.loading() && this.appointments().length === 0
  );

  // Agrupa os agendamentos por data (formato yyyy-MM-dd)
  readonly groupedAppointments = computed(() => {
    const groups: Record<string, Appointment[]> = {};
    for (const appointment of this.appointments()) {
      const dateKey = new Date(appointment.startTime)
        .toISOString()
        .split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appointment);
    }
    // Ordena as chaves (datas) de forma ascendente
    const sortedGroups: Record<string, Appointment[]> = {};
    Object.keys(groups)
      .sort()
      .forEach((key) => (sortedGroups[key] = groups[key]));
    return sortedGroups;
  });

  constructor() {
    effect(() => {
      if (!this.loading()) {
        console.log(
          '[Appointments] Agendamentos carregados:',
          this.appointments()
        );
      }
    });
  }

  async onDelete(id: string): Promise<void> {
    const confirmDelete = confirm('Deseja realmente excluir este agendamento?');
    if (!confirmDelete) return;
    await this.appointmentService.delete(id);
  }
}
