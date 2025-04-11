import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { Appointment } from 'src/app/shared/models/appointments.model';

@Component({
  selector: 'app-dashboard-employee',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './dashboard-employee.page.html',
  styleUrls: ['./dashboard-employee.page.scss'],
})
export class DashboardEmployeePage {
  private auth = inject(AuthService);
  private appointmentsService = inject(AppointmentsService);

  user = this.auth.currentUser;

  upcomingAppointments = signal<Appointment[]>([]);
  totalUpcoming = signal(0);

  constructor() {
    effect(() => {
      const employeeId = this.user()?.id;
      if (employeeId) {
        const list =
          this.appointmentsService.getEmployeeUpcomingAppointments(employeeId);
        this.upcomingAppointments.set(list);
        this.totalUpcoming.set(list.length);
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}
