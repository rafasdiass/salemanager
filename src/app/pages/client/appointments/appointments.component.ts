import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsListComponent } from './appointments-list/appointments-list.component';
import { AppointmentsFormComponent } from './appointments-form/appointments-form.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, AppointmentsListComponent, AppointmentsFormComponent],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss'],
})
export class AppointmentsComponent {}
