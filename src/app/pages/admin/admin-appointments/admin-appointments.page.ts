import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonDatetime,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';

import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AdminAppointmentsListPage } from './admin-appointments-list/admin-appointments-list.page';
import { Appointment } from 'src/app/shared/models/appointments.model';

@Component({
  selector: 'app-admin-appointments',
  templateUrl: './admin-appointments.page.html',
  styleUrls: ['./admin-appointments.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    IonDatetime,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    AdminAppointmentsListPage,
  ],
})
export class AdminAppointmentsPage implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly authService = inject(AuthService);

  readonly companyId = this.authService.primaryCompanyId;
  readonly loading = this.appointmentsService.loading;
  readonly allAppointments = this.appointmentsService.appointments;
  readonly error = signal<string | null>(null);

  readonly selectedStatus = signal<
    'scheduled' | 'completed' | 'canceled' | 'all'
  >('all');

  readonly startDate = signal<string>(
    new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
  );
  readonly endDate = signal<string>(
    new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
  );

  readonly filteredAppointments = computed<Appointment[]>(() => {
    try {
      const status = this.selectedStatus();
      const start = new Date(this.startDate());
      const end = new Date(this.endDate());

      return this.allAppointments().filter((appt) => {
        const apptDate = new Date(appt.startTime);
        const byCompany = appt.companyId === this.companyId();
        const byStatus = status === 'all' || appt.status === status;
        const inRange = apptDate >= start && apptDate <= end;
        return byCompany && byStatus && inRange;
      });
    } catch {
      this.error.set('Erro ao filtrar os agendamentos.');
      return [];
    }
  });

  ngOnInit(): void {
    effect(() => {
      if (!this.loading()) {
        this.error.set(null); // limpa erro se os dados chegaram
        console.log(
          '[AdminAppointmentsPage] Agendamentos filtrados:',
          this.filteredAppointments()
        );
      }
    });
  }

  changeStatusFilter(value: 'scheduled' | 'completed' | 'canceled' | 'all') {
    this.selectedStatus.set(value);
  }

  onStartDateChange(value: string | null | undefined) {
    if (typeof value === 'string') {
      this.startDate.set(value);
    }
  }

  onEndDateChange(value: string | null | undefined) {
    if (typeof value === 'string') {
      this.endDate.set(value);
    }
  }

  resetFilters(): void {
    this.selectedStatus.set('all');
    const today = new Date();
    this.startDate.set(new Date(today.setHours(0, 0, 0, 0)).toISOString());
    this.endDate.set(new Date(today.setHours(23, 59, 59, 999)).toISOString());
  }
  getDateFromEvent(value: string | string[] | null | undefined): string | null {
    if (Array.isArray(value)) return value[0] || null;
    return value ?? null;
  }
}
