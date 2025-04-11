import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesFormComponent } from './services-form/services-form.component';
import { ServicesListComponent } from './services-list/services-list.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ServicesFormComponent, ServicesListComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent {}
