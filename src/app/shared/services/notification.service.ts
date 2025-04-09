import { Injectable, signal } from '@angular/core';
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from '@angular/fire/messaging';
import { initializeApp, getApps } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import {
  AdminNotificacao,
  clientNotificacao,
  employeeNotificacao,
  StatusNotificacao,
  TipoDestinatario,
  FormaEnvio,
  TipoNotificacao,
} from '../models/notificacao.model';
import { AuthenticatedUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  // Signals para armazenar notificações de todos os perfis
  public readonly allNotifications = signal<
    (AdminNotificacao | clientNotificacao | employeeNotificacao)[]
  >([]);
  public readonly adminNotifications = signal<AdminNotificacao[]>([]);
  public readonly clientNotifications = signal<clientNotificacao[]>([]);
  public readonly employeeNotifications = signal<employeeNotificacao[]>([]);

  private messaging: Messaging | null = null;

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    this.initFirebaseMessaging();
  }

  private async initFirebaseMessaging(): Promise<void> {
    try {
      // ✅ Verifica se já há um app do Firebase inicializado
      if (!getApps().length) {
        initializeApp(environment.firebase);
      }

      this.messaging = getMessaging();
      await this.requestPermission();
      this.listenForMessages();
    } catch (error: any) {
      console.error(
        '[NotificationsService] Erro ao inicializar Firebase Messaging:',
        error,
        'Detalhes:',
        error?.message || error,
      );
    }
  }

  private async requestPermission(): Promise<void> {
    try {
      const permission = await Notification.requestPermission();
      console.log('[NotificationsService] Permissão solicitada:', permission);
      if (permission !== 'granted') {
        console.warn('[NotificationsService] Permissão de notificação negada.');
        return;
      }
      if (!this.messaging) {
        console.error(
          '[NotificationsService] Firebase Messaging não inicializado.',
        );
        return;
      }
      const token = await getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey,
      });
      if (token) {
        console.log('[NotificationsService] Token FCM recebido:', token);
        await this.saveToken(token);
      } else {
        console.warn('[NotificationsService] Nenhum token recebido.');
      }
    } catch (error: any) {
      console.error(
        '[NotificationsService] Erro ao solicitar permissão:',
        error,
        'Detalhes:',
        error?.message || error,
      );
    }
  }

  private async saveToken(token: string): Promise<void> {
    try {
      await this.apiService.post<{ token: string }>('notificacoes/token', {
        token,
      });
      console.log('[NotificationsService] Token salvo no backend.');
    } catch (error: any) {
      console.error(
        '[NotificationsService] Erro ao salvar token no backend:',
        error,
        'Detalhes:',
        error?.message || error,
        error?.error,
      );
    }
  }

  private listenForMessages(): void {
    if (!this.messaging) {
      console.warn(
        '[NotificationsService] Firebase Messaging não inicializado.',
      );
      return;
    }
    onMessage(this.messaging, (payload) => {
      console.log('[NotificationsService] Nova notificação recebida:', payload);
      const notification = this.createNotificationFromPayload(payload);
      if (notification) {
        this.storeNotification(notification);
        this.showBrowserNotification(notification);
      }
    });
  }

  private createNotificationFromPayload(
    payload: FirebaseMessagingPayload,
  ): AdminNotificacao | clientNotificacao | employeeNotificacao | null {
    const employeeId = this.getemployeeId(payload);
    const clientId = this.getclientId(payload);
    const destinatario = this.getDestinatario(payload);
    if (!payload.notification) {
      console.warn('[NotificationsService] Payload inválido, ignorando.');
      return null;
    }
    const baseNotification = {
      id: payload.messageId ?? crypto.randomUUID(),
      titulo: payload.notification.title ?? 'Nova Notificação',
      mensagem: payload.notification.body ?? '',
      status: StatusNotificacao.ENVIADA,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      formaEnvio: FormaEnvio.IMEDIATO, // ✅ Correção da tipagem
      tipoNotificacao: TipoNotificacao.INFORMATIVO,
    };
    if (employeeId) {
      return { ...baseNotification, employeeId } as employeeNotificacao;
    } else if (clientId) {
      return { ...baseNotification, clientId } as clientNotificacao;
    } else {
      return {
        ...baseNotification,
        destinatario: destinatario ?? TipoDestinatario.TODOS_clients,
      } as AdminNotificacao;
    }
  }

  private storeNotification(
    notification:
      | AdminNotificacao
      | clientNotificacao
      | employeeNotificacao,
  ): void {
    this.allNotifications.update((prev) => [...prev, notification]);
    if ('employeeId' in notification) {
      this.employeeNotifications.update((prev) => [...prev, notification]);
    } else if ('clientId' in notification) {
      this.clientNotifications.update((prev) => [...prev, notification]);
    } else {
      this.adminNotifications.update((prev) => [...prev, notification]);
    }
  }

  private showBrowserNotification(
    notification:
      | AdminNotificacao
      | clientNotificacao
      | employeeNotificacao,
  ): void {
    if (!('Notification' in window)) {
      console.warn(
        '[NotificationsService] Este navegador não suporta notificações.',
      );
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(notification.titulo, {
          body: notification.mensagem,
          icon: '/assets/icons/notification.png',
        });
      }
    });
  }

  public async fetchNotifications(): Promise<void> {
    console.log('[NotificationsService] Iniciando fetch de notificações...');
    const currentUser: AuthenticatedUser | null =
      this.userService.getUserData();
    if (!currentUser) {
      console.error('[NotificationsService] Usuário não autenticado.');
      return;
    }
    try {
      const response = await this.apiService
        .get<{
          message: string;
          data: AdminNotificacao[];
        }>('notificacoes/admin')
        .toPromise();
      console.log(
        '[NotificationsService] Resposta do endpoint notificacoes/admin:',
        response,
      );
      this.adminNotifications.set(response?.data ?? []);
      this.allNotifications.set(response?.data ?? []);
    } catch (error: any) {
      console.error(
        '[NotificationsService] ❌ Erro ao buscar notificações:',
        error,
        'Detalhes:',
        error?.message || error,
        error?.error,
      );
    }
  }

  private getDestinatario(
    payload: FirebaseMessagingPayload,
  ): TipoDestinatario | undefined {
    return payload.data?.['destinatario'] as TipoDestinatario | undefined;
  }

  private getclientId(
    payload: FirebaseMessagingPayload,
  ): string | undefined {
    return payload.data?.['clientId'];
  }

  private getemployeeId(
    payload: FirebaseMessagingPayload,
  ): string | undefined {
    return payload.data?.['employeeId'];
  }
}

interface FirebaseMessagingPayload {
  messageId?: string;
  notification?: { title?: string; body?: string };
  data?: { destinatario?: string; clientId?: string; employeeId?: string };
}
