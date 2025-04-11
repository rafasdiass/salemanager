import { Component } from '@angular/core';
import { ClientsFormComponent } from './clients-form/clients-form.component';
import { ClientsListComponent } from './clients-list/clients-list.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [ClientsFormComponent, ClientsListComponent],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
})
export class ClientsComponent {}
