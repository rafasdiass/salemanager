import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonList,
  IonLabel,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';

import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-client-appointments',
  templateUrl: './client-appointments.page.html',
  styleUrls: ['./client-appointments.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonList,
    IonLabel,
    IonButton,
    IonIcon,
  ],
})
export class ClientAppointmentsPage implements OnInit {
  private readonly appointmentService = inject(AppointmentsService);
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;
  readonly companyId = this.authService.primaryCompanyId;

  readonly loading = this.appointmentService.loading;
  readonly appointments = this.appointmentService.appointments;

  readonly upcomingAppointments = computed(() => {
    const now = new Date();
    const user = this.user();
    return this.appointments().filter(
      (a) =>
        a.clientId === user?.id &&
        a.companyId === this.companyId() &&
        new Date(a.startTime) > now
    );
  });

  ngOnInit(): void {
    effect(() => {
      if (!this.loading()) {
        console.log(
          '[ClientAppointmentsPage] Agendamentos futuros:',
          this.upcomingAppointments()
        );
      }
    });
  }

  async onCancel(id?: string): Promise<void> {
    if (!id) return;
    const confirmed = confirm('Deseja cancelar este agendamento?');
    if (!confirmed) return;
    await this.appointmentService.cancelAppointment(
      id,
      'Cancelado pelo cliente'
    );
  }
}
