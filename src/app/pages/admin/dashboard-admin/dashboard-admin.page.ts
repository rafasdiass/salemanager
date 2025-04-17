import { Component, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ClientService } from 'src/app/shared/services/clients.service';
import { AdminService } from 'src/app/shared/services/admin.service';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ServicesService } from 'src/app/shared/services/services.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './dashboard-admin.page.html',
  styleUrls: ['./dashboard-admin.page.scss'],
})
export class DashboardAdminPage {
  private readonly auth = inject(AuthService);
  private readonly clients = inject(ClientService);
  private readonly adminService = inject(AdminService);
  private readonly appointments = inject(AppointmentsService);
  private readonly services = inject(ServicesService);

  /** Dados do admin logado */
  readonly admin = this.auth.user; // já é computed<AuthenticatedUser|null>

  /** Totais de cada entidade */
  readonly totalClients = signal(0);
  readonly totalEmployees = signal(0);
  readonly totalAppointments = signal(0);
  readonly totalServices = signal(0);

  /** Lista de funcionários (só leitura) */
  readonly employees = computed(() => this.adminService.employees());

  constructor() {
    // Quando qualquer lista mudar, atualiza os totais
    effect(() => {
      this.totalClients.set(this.clients.filteredClients().length);
      this.totalEmployees.set(this.employees().length);
      this.totalAppointments.set(this.appointments.appointments().length);
      this.totalServices.set(this.services.services().length);
    });
  }

  logout() {
    this.auth.logout();
  }
}
