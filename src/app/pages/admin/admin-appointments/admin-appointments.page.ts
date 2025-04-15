import {
  Component,
  OnInit,
  inject,
  computed,
  effect,
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
  IonInput,
} from '@ionic/angular/standalone';

import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ClientService } from 'src/app/shared/services/clients.service';
import { AdminAppointmentsListPage } from './admin-appointments-list/admin-appointments-list.page';
import { AdminAppointmentsFilterService } from 'src/app/shared/services/admin-appointments-filter.service';
import { Client } from 'src/app/shared/models/client.model';

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
    IonInput,
    AdminAppointmentsListPage,
  ],
})
export class AdminAppointmentsPage implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly clientService = inject(ClientService);
  private readonly filterService = inject(AdminAppointmentsFilterService);

  readonly loading = this.appointmentsService.loading;
  readonly error = this.filterService.error;

  readonly appointments = this.appointmentsService.appointments;

  readonly clientMap = signal<Record<string, Client>>({});

  readonly filteredAppointments = computed(() =>
    this.filterService.filter(this.appointments(), this.clientMap())
  );

  readonly selectedStatus = this.filterService.selectedStatus;
  readonly searchTerm = this.filterService.searchTerm;
  readonly startDate = this.filterService.startDate;
  readonly endDate = this.filterService.endDate;

  ngOnInit(): void {
    this.loadClients();

    effect(() => {
      if (!this.loading()) this.error.set(null);
    });
  }

  private async loadClients(): Promise<void> {
    try {
      const clients = await this.clientService.listAll().toPromise();

      const map = (clients ?? []).reduce((acc, client) => {
        if (client.id) acc[client.id] = client;
        return acc;
      }, {} as Record<string, Client>);

      this.clientMap.set(map);
    } catch (err) {
      this.error.set('Erro ao carregar clientes.');
      console.error('[AdminAppointmentsPage] Erro ao carregar clientes:', err);
    }
  }

  resetFilters(): void {
    this.filterService.reset();
  }

  onStartDateChange(value: string | null | undefined) {
    if (typeof value === 'string') this.startDate.set(value);
  }

  onEndDateChange(value: string | null | undefined) {
    if (typeof value === 'string') this.endDate.set(value);
  }

  updateSearchTerm(value: string) {
    this.searchTerm.set(value);
  }

  updateStatus(value: 'scheduled' | 'completed' | 'canceled' | 'all') {
    this.selectedStatus.set(value);
  }

  getDateFromEvent(value: string | string[] | null | undefined): string | null {
    if (Array.isArray(value)) return value[0] || null;
    return value ?? null;
  }
}
