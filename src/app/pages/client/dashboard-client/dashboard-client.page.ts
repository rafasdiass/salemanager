import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { Appointment } from 'src/app/shared/models/appointments.model';
import { EstablishmentService } from 'src/app/shared/services/establishment.service';
import { Company } from 'src/app/shared/models/company.model';
import { ServicesService } from 'src/app/shared/services/services.service';
import { Service } from 'src/app/shared/models/service.model';

@Component({
  selector: 'app-dashboard-client',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './dashboard-client.page.html',
  styleUrls: ['./dashboard-client.page.scss'],
})
export class DashboardClientPage {
  private auth = inject(AuthService);
  private appointmentsService = inject(AppointmentsService);
  private establishmentService = inject(EstablishmentService);
  private servicesService = inject(ServicesService);

  // Agora usa computed moderno diretamente
  client = this.auth.user; // computed<AuthenticatedUser | null>

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

  // Inputs do formulário
  selectedDate = '';
  selectedTime = '';
  selectedProfessionalId = '';
  selectedServiceId = '';

  // Temporário
  professionals = [
    { id: 'prof-001', name: 'Ana Silva' },
    { id: 'prof-002', name: 'Carlos Souza' },
  ];

  constructor() {
    // Carrega agendamentos do cliente
    effect(() => {
      const clientId = this.client()?.id;
      if (!clientId) return;

      const appts = this.appointmentsService.getClientAppointments(clientId);
      this.allAppointments.set(appts);
    });

    // Carrega dados da empresa vinculada
    effect(() => {
      const companyId = this.client()?.companyIds?.[0];
      if (!companyId) return;

      this.establishmentService.getById(companyId).subscribe((data) => {
        this.company.set(data ?? null);
      });
    });

    // Mapeia serviços da empresa
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

  getServiceMapAsArray(): [string, string][] {
    return Array.from(this.servicesMap().entries());
  }

  getServiceName(serviceId: string): string {
    return this.servicesMap().get(serviceId) ?? 'Serviço desconhecido';
  }

  createAppointment() {
    const clientId = this.client()?.id;
    const companyId = this.client()?.companyIds?.[0];
    const serviceId = this.selectedServiceId;
    const employeeId = this.selectedProfessionalId;

    if (
      !clientId ||
      !companyId ||
      !serviceId ||
      !employeeId ||
      !this.selectedDate ||
      !this.selectedTime
    ) {
      alert('Preencha todos os campos.');
      return;
    }

    const start = new Date(`${this.selectedDate}T${this.selectedTime}`);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 30);

    const newAppointment: Appointment = {
      companyId,
      clientId,
      employeeId,
      serviceId,
      startTime: start,
      endTime: end,
      status: 'scheduled',
      paymentStatus: 'pending',
      price: 0,
      createdBy: clientId,
    };

    this.appointmentsService.create(newAppointment).subscribe({
      next: () => {
        alert('Agendamento criado com sucesso!');
        this.allAppointments.update((appts) => [...appts, newAppointment]);
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao criar agendamento.');
      },
    });
  }

  logout() {
    this.auth.logout();
  }
}
