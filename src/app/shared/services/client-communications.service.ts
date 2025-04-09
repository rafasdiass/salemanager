import { Injectable, WritableSignal, signal, effect } from '@angular/core';
import { ApiService } from './api.service';
import { NotificationsService } from './notification.service';
import { clientCommunication } from '../models/communication.model';
import { clientNotificacao } from '../models/notificacao.model';

@Injectable({
  providedIn: 'root',
})
export class clientCommunicationsService {
  private readonly endpoint = 'notificacoes/comunicados';

  /** Signal para armazenar o estado dos comunicados do client */
  public readonly communications: WritableSignal<
    ReadonlyArray<clientCommunication>
  > = signal([]);

  constructor(
    private readonly apiService: ApiService,
    private readonly notificationsService: NotificationsService,
  ) {
    // Reage automaticamente às novas notificações do Firebase sem subscribe()
    effect(() => {
      const newNotifications =
        this.notificationsService.clientNotifications();
      if (newNotifications.length > 0) {
        const latestNotification =
          newNotifications[newNotifications.length - 1];
        this.handleIncomingCommunication(latestNotification);
      }
    });
  }

  /**
   * **Captura mensagens recebidas via Firebase Cloud Messaging (FCM) e as converte para um comunicado.**
   * @param notification Notificação recebida.
   */
  private handleIncomingCommunication(
    notification: clientNotificacao,
  ): void {
    if (!notification || !notification.id) {
      console.warn(
        '[clientCommunicationsService] ⚠️ Comunicação inválida recebida, ignorando.',
        notification,
      );
      return;
    }

    // Converte `clientNotificacao` para `clientCommunication`
    const communication: clientCommunication = {
      id: notification.id,
      titulo: notification.titulo,
      mensagem: notification.mensagem,
      data: notification.criadoEm || new Date(), // Garantir que sempre tenha um valor
    };

    this.communications.update((current) => [...current, communication]);
    console.debug(
      '[clientCommunicationsService] 📥 Nova comunicação armazenada:',
      communication,
    );
  }

  /**
   * **Carrega todos os comunicados de um client via API e atualiza o estado.**
   * @param clientId ID do client.
   */
  public async loadAndSetCommunications(clientId: string): Promise<void> {
    try {
      const data = await this.apiService
        .get<
          clientCommunication[]
        >(`${this.endpoint}/client/${clientId}`)
        .toPromise();

      if (!data || !Array.isArray(data)) {
        console.warn(
          '[clientCommunicationsService] ⚠️ Nenhum comunicado encontrado.',
        );
        return;
      }

      this.communications.set(data);
      console.log(
        '[clientCommunicationsService] ✅ Comunicados carregados.',
        data,
      );
    } catch (error) {
      console.error(
        '[clientCommunicationsService] ❌ Erro ao carregar comunicados:',
        error,
      );
    }
  }

  /**
   * **Obtém todos os comunicados de um client via API.**
   * @param clientId ID do client.
   * @returns Promise com todos os comunicados.
   */
  public async getAll(clientId: string): Promise<clientCommunication[]> {
    try {
      return (
        (await this.apiService
          .get<
            clientCommunication[]
          >(`${this.endpoint}/client/${clientId}`)
          .toPromise()) ?? []
      );
    } catch (error) {
      console.error(
        '[clientCommunicationsService] ❌ Erro ao obter comunicados:',
        error,
      );
      return [];
    }
  }

  /**
   * **Atualiza manualmente o estado com uma lista de comunicados.**
   * @param communications Lista de comunicados a serem definidas no estado.
   */
  public updateSignal(communications: clientCommunication[]): void {
    if (!Array.isArray(communications)) {
      console.error(
        '[clientCommunicationsService] ❌ Tentativa de definir comunicados inválidos.',
      );
      return;
    }
    this.communications.set(communications);
  }
}
