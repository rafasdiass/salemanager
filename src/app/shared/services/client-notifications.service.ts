import { Injectable, signal, inject, effect } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { NotificationsService } from './notification.service';
import { clientNotificacao } from '../models/notificacao.model';
@Injectable({
  providedIn: 'root',
})
export class clientNotificationsService {
  private readonly endpoint = 'notificacoes/client';
  public readonly notifications = signal<ReadonlyArray<clientNotificacao>>(
    [],
  );

  private readonly apiService = inject(ApiService);
  private readonly notificationsService = inject(NotificationsService);

  constructor() {
    effect(() => {
      const centralCoopNotifs =
        this.notificationsService.clientNotifications();
      console.log(
        '[clientNotificationsService] Effect: notificações do client atualizadas no NotificationsService:',
        centralCoopNotifs,
      );
      this.notifications.set(
        Array.isArray(centralCoopNotifs) ? [...centralCoopNotifs] : [],
      );
    });
  }

  /**
   * Carrega as notificações do client via API e atualiza o signal.
   */
  public async loadNotifications(clientId: string): Promise<void> {
    if (!clientId) {
      console.error(
        '[clientNotificationsService] ❌ O ID do client é obrigatório.',
      );
      return;
    }
    try {
      console.log(
        `[clientNotificationsService] 🔄 Carregando notificações para o client ID=${clientId}...`,
      );
      const response = await lastValueFrom(
        this.apiService.get<{
          message: string;
          data: { data: clientNotificacao[]; total: number };
        }>(`${this.endpoint}/${clientId}`),
      );
      console.log(
        '[clientNotificationsService] Resposta do endpoint:',
        response,
      );

      // ✅ Acessa corretamente o array de notificações dentro de response.data.data
      const clientNotifs: clientNotificacao[] = Array.isArray(
        response?.data?.data,
      )
        ? response.data.data
        : [];

      // ✅ Atualiza o signal com as notificações
      this.notifications.set(clientNotifs);
      console.log(
        '[clientNotificationsService] ✅ Notificações carregadas:',
        this.notifications(),
      );
    } catch (error: any) {
      console.error(
        '[clientNotificationsService] ❌ Erro ao carregar notificações:',
        error,
        'Detalhes:',
        error?.message || error,
      );
    }
  }

  /**
   * Marca uma notificação como lida.
   */
  public async markAsRead(
    notificationId: string,
    clientId: string,
  ): Promise<void> {
    if (!notificationId || !clientId) {
      console.error(
        '[clientNotificationsService] ❌ ID da notificação e/ou do client são obrigatórios para marcar como lida.',
      );
      return;
    }
    try {
      console.log(
        `[clientNotificationsService] 🔄 Marcando notificação ID=${notificationId} como lida para o client ID=${clientId}...`,
      );
      await lastValueFrom(
        this.apiService.patch<void>(
          `${this.endpoint}/marcar-lida/${notificationId}?userId=${clientId}`,
          {},
        ),
      );
      console.log(
        '[clientNotificationsService] ✅ Notificação marcada como lida.',
      );
      // Recarrega as notificações atualizadas
      await this.loadNotifications(clientId);
    } catch (error: any) {
      console.error(
        '[clientNotificationsService] ❌ Erro ao marcar notificação como lida:',
        error,
        'Detalhes:',
        error?.message || error,
      );
    }
  }

  /**
   * Atualiza manualmente o signal com uma lista de notificações.
   */
  public updateSignal(notifications: clientNotificacao[]): void {
    if (!Array.isArray(notifications)) {
      console.warn(
        '[clientNotificationsService] ❌ Tentativa de definir notificações inválidas.',
      );
      return;
    }
    this.notifications.set(notifications);
    console.log(
      '[clientNotificationsService] Signal atualizado com notificações:',
      this.notifications(),
    );
  }
}