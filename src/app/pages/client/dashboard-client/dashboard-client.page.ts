import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { Appointment } from 'src/app/shared/models/appointments.model';
import { EstablishmentService } from 'src/app/shared/services/establishment.service';
import { Company } from 'src/app/shared/models/company.model';
import { ServicesService } from 'src/app/shared/services/services.service';
import { Service } from 'src/app/shared/models/service.model';

@Component({
  selector: 'app-dashboard-client',
  templateUrl: './dashboard-client.page.html',
  styleUrls: ['./dashboard-client.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class DashboardClientPage {
  private auth = inject(AuthService);
  private appointmentsService = inject(AppointmentsService);
  private establishmentService = inject(EstablishmentService);
  private servicesService = inject(ServicesService);

  client = this.auth.currentUser;

  allAppointments = signal<Appointment[]>([]);
  company = signal<Company | null>(null);
  servicesMap = signal<Map<string, string>>(new Map());

  upcomingAppointments = computed(() => {
    const now = new Date();
    return this.allAppointments().filter((a) => new Date(a.startTime) > now);
  });

  pastAppointments = computed(() => {
    const now = new Date();
    return this.allAppointments().filter((a) => new Date(a.endTime) < now);
  });

  totalVisits = computed(() => this.pastAppointments().length);

  constructor() {
    // Carrega os agendamentos do cliente
    effect(() => {
      const clientId = this.client()?.id;
      if (!clientId) return;

      const appts = this.appointmentsService.getClientAppointments(clientId);
      this.allAppointments.set(appts);
    });

    // Carrega os dados da empresa vinculada
    effect(() => {
      const companyId = this.client()?.companyIds?.[0];
      if (!companyId) return;

      this.establishmentService.getById(companyId).subscribe((data) => {
        this.company.set(data ?? null);
      });
    });

    // Carrega e mapeia os serviços da empresa
    effect(() => {
      const companyId = this.client()?.companyIds?.[0];
      if (!companyId) return;

      const allServices = this.servicesService.services();
      const map = new Map<string, string>();

      allServices.forEach((s: Service) => {
        if (s.companyId === companyId) {
          map.set(s.id!, s.name);
        }
      });

      this.servicesMap.set(map);
    });
  }

  logout() {
    this.auth.logout();
  }

  getServiceName(serviceId: string): string {
    return this.servicesMap().get(serviceId) ?? 'Serviço desconhecido';
  }
}
