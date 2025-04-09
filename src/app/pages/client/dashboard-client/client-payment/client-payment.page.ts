import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { clientPaymentsHistoryPage } from './client-payments-history/client-payments-history.page';
import { clientPaymentsManagementPage } from './client-payments-management/client-payments-management.page';

@Component({
  selector: 'app-client-payment',
  templateUrl: './client-payment.page.html',
  styleUrls: ['./client-payment.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    clientPaymentsHistoryPage,
    clientPaymentsManagementPage,
  ],
})
export class clientPaymentPage {
  activeTab: 'history' | 'management' = 'history';

  /**
   * Alterna entre abas de histórico e gestão de pagamentos.
   * @param tab Aba a ser ativada.
   */
  switchTab(tab: 'history' | 'management'): void {
    this.activeTab = tab;
  }
}
