import { Component, OnInit, signal, inject, effect } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { clientNotificationsService } from 'src/app/shared/services/client-notifications.service';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import {
  clientNotificacao,
  TipoNotificacao,
  StatusNotificacao,
} from 'src/app/shared/models/notificacao.model';
import { AuthenticatedUser } from 'src/app/shared/models/auth.model';
@Component({
  selector: 'app-notifications-client',
  templateUrl: './notifications-client.page.html',
  styleUrls: ['./notifications-client.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonSpinner,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class NotificationsclientPage implements OnInit {
  public notifications = signal<clientNotificacao[]>([]);
  public errorMessage = signal<string | null>(null);
  public isLoading = signal<boolean>(true);

  private clientId: string | null = null;
  private clientNotificationsService = inject(clientNotificationsService);
  private localStorageService = inject(LocalStorageService);

  constructor() {
    // Observa mudanças no signal do serviço
    effect(() => {
      const updatedNotifications =
        this.clientNotificationsService.notifications();
      console.log(
        `[NotificationsclientPage] 🔄 Atualizando signal`,
        updatedNotifications,
      );
      this.notifications.set([...updatedNotifications]);
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadclientId();
    await this.loadNotifications();
  }

  /**
   * Obtém o ID do client a partir do LocalStorage.
   */
  private loadclientId(): void {
    const storedUser =
      this.localStorageService.getItem<AuthenticatedUser>('userData');
    if (storedUser?.id) {
      this.clientId = storedUser.id;
      console.log(`✅ client autenticado. ID: ${this.clientId}`);
    } else {
      this.logError('⚠️ client não autenticado ou ID não disponível.');
      this.clientId = null;
    }
  }

  /**
   * Carrega as notificações do client.
   */
  private async loadNotifications(): Promise<void> {
    if (!this.clientId) {
      this.logError('⛔ Tentativa de carregar notificações sem um ID válido.');
      return;
    }

    console.log(`🔄 Buscando notificações para client: ${this.clientId}`);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.clientNotificationsService.loadNotifications(
        this.clientId,
      );

      const notificationsArray = [
        ...this.clientNotificationsService.notifications(),
      ];
      console.log(
        `[NotificationsclientPage] ✅ Notificações após atualização:`,
        notificationsArray,
      );

      if (notificationsArray.length === 0) {
        this.errorMessage.set('Nenhuma notificação encontrada.');
      }

      this.notifications.set(notificationsArray);
    } catch (error) {
      this.logError('❌ Erro ao carregar notificações', error);
      this.errorMessage.set('Erro ao buscar notificações.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtém o ícone correspondente ao tipo de notificação.
   */
  getIcon(tipo: TipoNotificacao): string {
    switch (tipo) {
      case TipoNotificacao.ALERTA:
        return 'megaphone';
      case TipoNotificacao.IMPORTANTE:
        return 'alert';
      case TipoNotificacao.INFORMATIVO:
        return 'information-circle';
      default:
        return 'document-text';
    }
  }

  /**
   * Obtém o ícone correspondente ao status da notificação.
   */
  getStatusIcon(status: StatusNotificacao): string {
    switch (status) {
      case StatusNotificacao.PENDENTE:
        return 'time-outline';
      case StatusNotificacao.ENVIADA:
        return 'checkmark-circle';
      case StatusNotificacao.LIDA:
        return 'eye-outline';
      default:
        return 'help-circle';
    }
  }

  /**
   * Método utilitário para registrar mensagens de erro.
   */
  private logError(message: string, error?: unknown): void {
    console.error(`[NotificationsclientPage] ❌ ${message}`, error);
  }
}