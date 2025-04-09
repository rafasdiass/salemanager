import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonSpinner, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';

import { AdminNotificacao } from 'src/app/shared/models/notificacao.model';
import { AdminNotificationsService } from 'src/app/shared/services/admin-notifications.service';
import { NotificationsHistoryPage } from './notifications-history/notifications-history.page';
import { NotificationsCreateFormPage } from './notifications-create-form/notifications-create-form.page';

@Component({
  selector: 'app-notifications-admin',
  templateUrl: './notifications-admin.page.html',
  styleUrls: ['./notifications-admin.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonSpinner,
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    NotificationsHistoryPage,
    NotificationsCreateFormPage,
  ],
})
export class NotificationsAdminPage implements OnInit {
  public readonly notifications = signal<ReadonlyArray<AdminNotificacao>>([]);
  public readonly isLoading = signal<boolean>(true);
  private readonly notificationsService = inject(AdminNotificationsService);

  constructor() {}

  /**
   * Carrega as notificações quando a página é iniciada.
   */
  async ngOnInit(): Promise<void> {
    await this.loadNotifications();
  }

  /**
   * Obtém todas as notificações do backend.
   */
  private async loadNotifications(): Promise<void> {
    this.isLoading.set(true);
    try {
      console.log('[NotificationsAdminPage] 🔄 Carregando notificações...');
      await this.notificationsService.loadNotifications();

      // Atualiza o signal com o conteúdo do sinal centralizado
      this.notifications.set([...this.notificationsService.notifications()]);
      console.log(
        '[NotificationsAdminPage] ✅ Notificações carregadas:',
        this.notifications(),
      );
    } catch (error) {
      console.error(
        '[NotificationsAdminPage] ❌ Erro ao carregar notificações:',
        error,
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Reenvia uma notificação específica.
   */
  async resendNotification(id: string): Promise<void> {
    try {
      console.log(
        `[NotificationsAdminPage] 🔄 Reenviando notificação ${id}...`,
      );
      await this.notificationsService.resendNotification(id);
      await this.loadNotifications();
      console.log(`[NotificationsAdminPage] ✅ Notificação ${id} reenviada.`);
    } catch (error) {
      console.error(
        `[NotificationsAdminPage] ❌ Erro ao reenviar notificação ${id}:`,
        error,
      );
    }
  }

  /**
   * Exclui uma notificação.
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      console.log(`[NotificationsAdminPage] 🗑️ Excluindo notificação ${id}...`);
      await this.notificationsService.delete(id);
      await this.loadNotifications();
      console.log(`[NotificationsAdminPage] ✅ Notificação ${id} excluída.`);
    } catch (error) {
      console.error(
        `[NotificationsAdminPage] ❌ Erro ao excluir notificação ${id}:`,
        error,
      );
    }
  }

  /**
   * Trata o evento de criação de nova notificação.
   * Agora, apenas atualiza a lista sem chamar novamente o método create.
   */
  async onNotificationCreated(
    newNotification: AdminNotificacao,
  ): Promise<void> {
    try {
      console.log(
        `[NotificationsAdminPage] 📩 Evento onNotificationCreated recebido.`,
      );
      // Atualiza a lista de notificações sem recriar a notificação
      await this.loadNotifications();
      console.log(
        `[NotificationsAdminPage] ✅ Notificações atualizadas após nova criação.`,
      );
    } catch (error) {
      console.error(
        `[NotificationsAdminPage] ❌ Erro ao atualizar notificações:`,
        error,
      );
    }
  }
}
