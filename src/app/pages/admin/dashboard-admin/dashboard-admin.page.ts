import { Component, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ClientService } from 'src/app/shared/services/clients.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ServicesService } from 'src/app/shared/services/services.service';
import { AuthenticatedUser } from 'src/app/shared/models/auth.model';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './dashboard-admin.page.html',
  styleUrls: ['./dashboard-admin.page.scss'],
})
export class DashboardAdminPage {
  private auth = inject(AuthService);
  private clients = inject(ClientService);
  private employees = inject(EmployeeService);
  private appointments = inject(AppointmentsService);
  private services = inject(ServicesService);

  // Substituição do currentUser antigo por signal moderno
  admin = this.auth.user; // já é um computed<AuthenticatedUser | null>

  totalClients = signal(0);
  totalEmployees = signal(0);
  totalAppointments = signal(0);
  totalServices = signal(0);

  constructor() {
    effect(() => {
      this.totalClients.set(this.clients.filteredClients().length);
      this.totalEmployees.set(this.employees.employees().length);
      this.totalAppointments.set(this.appointments.appointments().length);
      this.totalServices.set(this.services.services().length);
    });
  }

  logout() {
    this.auth.logout();
  }
}
