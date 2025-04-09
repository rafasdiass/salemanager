import { Component, OnInit, inject, signal, effect } from '@angular/core';
import {
  IonContent,
  IonSpinner,
  IonHeader,
  IonCard,
  IonCardHeader,
  IonTitle,
  IonCardContent,
  IonRouterOutlet,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarclientPage } from '../navbar-client/navbar-client.page';
import { clientBenefitsPage } from './client-benefits/client-benefits.page';
import { clientPaymentPage } from './client-payment/client-payment.page';
import { clientPropertyStatusPage } from './client-property-status/client-property-status.page';
import { clientMensagensPage } from '../client-mensagens/client-mensagens.page';
import { clientNotificationsService } from 'src/app/shared/services/client-notifications.service';
import { clientNotificacao } from 'src/app/shared/models/notificacao.model';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import { AuthenticatedUser } from 'src/app/shared/models/auth.model';

@Component({
  selector: 'app-dashboard-client',
  templateUrl: './dashboard-client.page.html',
  styleUrls: ['./dashboard-client.page.scss'],
  standalone: true,
  imports: [
    IonRouterOutlet,
    IonCardContent,
    IonTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonSpinner,
   
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    CommonModule,
    FormsModule,
    NavbarclientPage,
    clientBenefitsPage,
    clientPaymentPage,
    clientPropertyStatusPage,
    
  ],
})
export class DashboardclientPage implements OnInit {
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  notifications = signal<clientNotificacao[]>([]);

  private notificationsService = inject(clientNotificationsService);
  private localStorageService = inject(LocalStorageService);
  private clientId: string | null = null;

  constructor() {
    // Observa mudanças nas notificações e atualiza automaticamente
    effect(() => {
      const updatedNotifications = [
        ...this.notificationsService.notifications(),
      ];
      this.notifications.set(updatedNotifications);
    });
  }

  ngOnInit(): void {
    this.loadclientId();
    this.loadNotifications();
  }

  private loadclientId(): void {
    const storedUser =
      this.localStorageService.getItem<AuthenticatedUser>('userData');
    if (storedUser?.id) {
      this.clientId = storedUser.id;
    } else {
      this.errorMessage.set('Usuário não autenticado.');
      this.clientId = null;
    }
  }

  private async loadNotifications(): Promise<void> {
    if (!this.clientId) {
      this.errorMessage.set('Erro ao carregar notificações. ID inválido.');
      return;
    }

    try {
      this.isLoading.set(true);
      await this.notificationsService.loadNotifications(this.clientId);
    } catch (error) {
      this.errorMessage.set('Erro ao buscar notificações.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'ALERTA':
        return 'megaphone-outline';
      case 'IMPORTANTE':
        return 'alert-circle-outline';
      case 'INFORMATIVO':
        return 'information-circle-outline';
      default:
        return 'notifications-outline';
    }
  }
}
