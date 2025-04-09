import { Component, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  SegmentCustomEvent,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsclientPage } from './notifications-client/notifications-client.page';
import { ComunicadosclientPage } from './comunicados-client/comunicados-client.page';

@Component({
  selector: 'app-client-mensagens',
  templateUrl: './client-mensagens.page.html',
  styleUrls: ['./client-mensagens.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    CommonModule,
    FormsModule,
    NotificationsclientPage,
    ComunicadosclientPage,
  ],
})
export class clientMensagensPage {
  /**
   * Signal para controlar o segmento selecionado.
   * O valor inicial é 'notificacoes'.
   */
  public selectedSegment = signal<'notificacoes' | 'comunicados'>('notificacoes');

  constructor() {}

  /**
   * Manipula a mudança no ion-segment.
   * Atualiza o signal `selectedSegment` apenas se o valor for válido.
   * @param event Evento emitido pelo ion-segment.
   */
  public onSegmentChanged(event: SegmentCustomEvent): void {
    const selectedValue = event.detail.value;
    if (selectedValue === 'notificacoes' || selectedValue === 'comunicados') {
      this.selectedSegment.set(selectedValue);
    } else {
      console.warn(`Segmento inválido: ${selectedValue}`);
    }
  }
}
