import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';

import {
  NotificacaoBase,
  TipoNotificacao,
  StatusNotificacao,
} from 'src/app/shared/models/notificacao.model';

@Component({
  selector: 'app-notifications-history',
  templateUrl: './notifications-history.page.html',
  styleUrls: ['./notifications-history.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
  ],
})
export class NotificationsHistoryPage {
  /**
   * Recebe a lista de notificações do backend.
   */
  @Input() notifications: ReadonlyArray<NotificacaoBase> = [];

  /**
   * Controla o carregamento das notificações.
   */
  @Input() isLoading: boolean = false;

  constructor() {}

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
   * Verifica se a notificação é agendada e retorna a data formatada.
   */
  getAgendamento(notificacao: NotificacaoBase): string | null {
    return notificacao.agendadoPara
      ? new Date(notificacao.agendadoPara).toLocaleString('pt-BR')
      : null;
  }
}
