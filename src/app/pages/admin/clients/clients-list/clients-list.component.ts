import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsService } from '../../../../shared/services/clients.service';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss'],
})
export class ClientsListComponent {
  private readonly clientsService = inject(ClientsService);

  // Signals computados a partir do ClientsService
  clients = this.clientsService.clients;
  loading = this.clientsService.loading;
  error = this.clientsService.error;
}
