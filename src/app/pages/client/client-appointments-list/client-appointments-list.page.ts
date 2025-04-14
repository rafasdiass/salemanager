import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';

import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-client-appointments-list',
  templateUrl: './client-appointments-list.page.html',
  styleUrls: ['./client-appointments-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
  ],
})
export class ClientAppointmentsListPage implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user; // ✅ agora existe!
  readonly companyId = this.authService.primaryCompanyId;

  readonly pastAppointments = computed(() => {
    const now = new Date();
    const user = this.user();
    return this.appointmentsService
      .appointments()
      .filter(
        (a) =>
          a.clientId === user?.id &&
          a.companyId === this.companyId() &&
          new Date(a.endTime) < now
      );
  });

  ngOnInit(): void {}
}
