import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesService } from '../../../../shared/services/services.service';
import { Service } from '../../../../shared/models/models';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss'],
})
export class ServicesListComponent {
  private readonly servicesService = inject(ServicesService);
  services = this.servicesService.services;
  loading = this.servicesService.loading;

  async deleteService(id: string): Promise<void> {
    const confirmDelete = confirm(
      'Tem certeza que deseja excluir este serviço? Esta ação não poderá ser desfeita.'
    );
    if (confirmDelete) {
      await this.servicesService.delete(id);
    }
  }
}
