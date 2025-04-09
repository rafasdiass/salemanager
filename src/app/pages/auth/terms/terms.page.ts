import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonFooter,
  IonText,
  IonIcon,
  IonButtons,
  IonItem,
  IonList,
  IonLabel,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonFooter,
    IonText,
    IonItem,
    IonList,
    IonLabel,
    CommonModule,
    FormsModule,
  ],
})
export class TermsPage {
  @Input() emailContato: string = 'suporte@vivermais.coop';
  @Input() telefoneContato: string = '(XX) XXXX-XXXX';

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }
}
