import { Injectable, WritableSignal, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { client } from '../models/client.model';

@Injectable({
  providedIn: 'root',
})
export class clientservice {
  private readonly endpoint = 'clients';

  /** Signal para armazenar e compartilhar o estado do client atual */
  public currentclient: WritableSignal<client | null> = signal(null);

  constructor(private apiService: ApiService) {}

  /**
   * Carrega o client pelo ID e atualiza o signal `currentclient`.
   * @param clientId O ID do client.
   */
  loadclientById(clientId: string): void {
    this.apiService.get<client>(`${this.endpoint}/${clientId}`).subscribe({
      next: (client) => this.currentclient.set(client),
      error: (err) => console.error('Erro ao carregar client:', err),
    });
  }

  /**
   * Obtém o ID do client autenticado a partir do signal `currentclient`.
   * @returns O ID do client ou `null` se não estiver autenticado.
   */
  getCurrentclientId(): string | null {
    const client = this.currentclient();
    return client ? client.id : null;
  }

  /**
   * Atualiza o estado do client atual.
   * @param client Os dados atualizados do client.
   */
  updateCurrentclient(client: client): void {
    this.currentclient.set(client);
  }

  /**
   * Limpa o estado do client atual.
   */
  clearCurrentclient(): void {
    this.currentclient.set(null);
  }

  /**
   * Verifica se o client atual está aprovado.
   * @returns `true` se o status do client for 'aprovado', caso contrário, `false`.
   */
  isclientAprovado(): boolean {
    const client = this.currentclient();
    return client ? client.status === 'aprovado' : false;
  }
}
