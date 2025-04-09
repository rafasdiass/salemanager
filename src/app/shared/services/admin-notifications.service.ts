import { Injectable, signal, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { NotificationsService } from './notification.service';
import { UserService } from './user.service';
import {
  AdminNotificacao,
  TipoDestinatario,
} from '../models/notificacao.model';

@Injectable({
  providedIn: 'root',
})
export class AdminNotificationsService {
  private readonly endpoint = 'notificacoes';
  private readonly baseEndpoint = 'notificacoes';

  // Signal para armazenar as notificações
  public readonly notifications = signal<ReadonlyArray<AdminNotificacao>>([]);

  private readonly apiService = inject(ApiService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly userService = inject(UserService);

  constructor() {}

  /**
   * **Carrega todas as notificações administrativas**
   */
  public async loadNotifications(): Promise<void> {
    try {
      console.log('[AdminNotificationsService] 🔄 Carregando notificações...');
      await this.notificationsService.fetchNotifications();
      const adminNotifs = this.notificationsService.adminNotifications();
      console.log(
        '[AdminNotificationsService] 🔄 Notificações recebidas:',
        adminNotifs,
      );
      this.notifications.set([...adminNotifs]); // Atualiza a lista de notificações no signal
    } catch (error: any) {
      console.error(
        '[AdminNotificationsService] ❌ Erro ao carregar notificações:',
        error,
      );
    }
  }

  /**
   * **Cria uma nova notificação e adiciona ao signal sem duplicação**
   */
  public async create(notificacao: Partial<AdminNotificacao>): Promise<void> {
    try {
      const user = this.userService.getUserData();
      if (!user?.id) {
        console.warn('[AdminNotificationsService] ❌ Usuário não autenticado.');
        return;
      }

      if (!notificacao.titulo || !notificacao.mensagem) {
        console.warn(
          '[AdminNotificationsService] ❌ Título e mensagem são obrigatórios.',
        );
        return;
      }

      if (
        !notificacao.destinatario ||
        !Object.values(TipoDestinatario).includes(notificacao.destinatario)
      ) {
        console.warn('[AdminNotificationsService] ❌ Destinatário inválido.');
        return;
      }

      const payload: Partial<AdminNotificacao> = {
        ...notificacao,
        criadoPorId: user.id,
      };

      console.log(
        '[AdminNotificationsService] 🚀 Criando notificação:',
        payload,
      );

      // Verifica se já existe uma notificação com os mesmos dados antes de criar
      const existingNotification = this.notifications().find(
        (n) => n.titulo === payload.titulo && n.mensagem === payload.mensagem,
      );

      if (existingNotification) {
        console.warn('[AdminNotificationsService] ⚠️ Notificação já existe.');
        return;
      }

      const createdNotification = await lastValueFrom(
        this.apiService.post<AdminNotificacao>(this.endpoint, payload),
      );

      console.log(
        '[AdminNotificationsService] ✅ Notificação criada:',
        createdNotification,
      );

      // ✅ Adiciona apenas a nova notificação ao signal, sem sobrescrever a lista
      this.notifications.set([...this.notifications(), createdNotification]);
    } catch (error: any) {
      console.error(
        '[AdminNotificationsService] ❌ Erro ao criar notificação:',
        error,
      );
    }
  }

  /**
   * **Atualiza uma notificação existente**
   */
  public async update(
    id: string,
    notificacao: Partial<AdminNotificacao>,
  ): Promise<void> {
    if (!id || !notificacao) {
      console.warn('[AdminNotificationsService] ❌ ID e dados obrigatórios.');
      return;
    }
    try {
      console.log(
        `[AdminNotificationsService] 🔄 Atualizando notificação ID=${id}:`,
        notificacao,
      );
      const updatedNotification = await lastValueFrom(
        this.apiService.patch<AdminNotificacao>(
          `${this.baseEndpoint}/${id}`,
          notificacao,
        ),
      );
      console.log(
        '[AdminNotificationsService] ✅ Notificação atualizada:',
        updatedNotification,
      );

      // ✅ Atualiza apenas a notificação alterada no signal
      this.notifications.set(
        this.notifications().map((n) =>
          n.id === id ? updatedNotification : n,
        ),
      );
    } catch (error: any) {
      console.error(
        '[AdminNotificationsService] ❌ Erro ao atualizar notificação:',
        error,
      );
    }
  }

  /**
   * **Exclui uma notificação pelo ID**
   */
  public async delete(id: string): Promise<void> {
    if (!id) {
      console.warn('[AdminNotificationsService] ❌ ID inválido para exclusão.');
      return;
    }
    try {
      console.log(
        `[AdminNotificationsService] 🗑️ Excluindo notificação com ID: ${id}`,
      );
      await lastValueFrom(
        this.apiService.delete<void>(`${this.baseEndpoint}/${id}`),
      );
      console.log('[AdminNotificationsService] ✅ Notificação excluída.');

      // ✅ Remove a notificação excluída do signal sem recarregar tudo
      this.notifications.set(this.notifications().filter((n) => n.id !== id));
    } catch (error: any) {
      console.error(
        '[AdminNotificationsService] ❌ Erro ao excluir notificação:',
        error,
      );
    }
  }

  /**
   * **Reenvia uma notificação**
   */
  public async resendNotification(id: string): Promise<void> {
    if (!id) {
      console.warn('[AdminNotificationsService] ❌ ID inválido para reenvio.');
      return;
    }
    try {
      console.log(
        `[AdminNotificationsService] 🔄 Reenviando notificação com ID: ${id}`,
      );
      await lastValueFrom(
        this.apiService.post<void>(`${this.endpoint}/reenviar/${id}`, {}),
      );
      console.log('[AdminNotificationsService] ✅ Notificação reenviada.');
      // ✅ Evita recarregar todas as notificações ao reenviar
    } catch (error: any) {
      console.error(
        '[AdminNotificationsService] ❌ Erro ao reenviar notificação:',
        error,
      );
    }
  }

  /**
   * **Obtém uma notificação específica pelo ID**
   */
  public async getNotificationById(
    id: string,
  ): Promise<AdminNotificacao | null> {
    if (!id) {
      console.warn('[AdminNotificationsService] ❌ ID inválido para busca.');
      return null;
    }
    try {
      console.log(
        `[AdminNotificationsService] 🔍 Buscando notificação com ID: ${id}`,
      );
      const notification = await lastValueFrom(
        this.apiService.get<AdminNotificacao>(`${this.baseEndpoint}/${id}`),
      );
      console.log(
        '[AdminNotificationsService] ✅ Notificação encontrada:',
        notification,
      );
      return notification;
    } catch (error: any) {
      console.error(
        '[AdminNotificationsService] ❌ Erro ao buscar notificação:',
        error,
      );
      return null;
    }
  }
}
