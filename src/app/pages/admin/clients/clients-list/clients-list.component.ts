import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ClientService } from 'src/app/shared/services/client.service';
import { FormsModule } from '@angular/forms';
import { Cliente } from 'src/app/shared/models/cliente.model';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss'],
})
export class ClientsListComponent {
  private readonly clientsService = inject(ClientService);

  /** Lista completa de clientes */
  readonly clients = this.clientsService.filteredClients;

  /** Termo digitado no campo de busca */
  readonly searchTerm = signal<string>('');

  /** Lista filtrada pelo termo de busca */
  readonly filteredClients = computed<Cliente[]>(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.clients();

    return this.clients().filter(
      (c) =>
        (c.nome || '').toLowerCase().includes(term) ||
        (c.telefone || '').toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term)
    );
  });

  /** Atualiza a lista manualmente */
  public initClients(): void {
    // Se precisar refazer o fetch manualmente no futuro
    // hoje a lista é reativa por sinal, mas deixamos a função pública para o botão
  }

  /** Recebe o valor da busca */
  public onSearch(term: string | null | undefined): void {
    this.searchTerm.set(term?.toString() ?? '');
  }

  /** Exibe um nome de fallback amigável */
  public getClientDisplayName(client: Cliente): string {
    return client.nome || client.email || client.telefone || 'Cliente sem nome';
  }
}
