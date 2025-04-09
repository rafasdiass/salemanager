import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { client } from 'src/app/shared/models/client.model';
import { FichaAdesaoService } from 'src/app/shared/services/ficha-adesao.service';
import { PropostaAdesao } from 'src/app/shared/models/proposta-adesao.model';

@Component({
  selector: 'app-view-client-details',
  templateUrl: './view-client-details.page.html',
  styleUrls: ['./view-client-details.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonIcon,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
  ],
})
export class ViewclientDetailsPage implements OnInit {
  @Input() client!: client; // client recebido como input do modal
  adesoes: PropostaAdesao[] = []; // Lista de adesões do client
  isLoading: boolean = false; // Indica o estado de carregamento

  constructor(
    private fichaAdesaoService: FichaAdesaoService, // Substituído para o serviço correto
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.loadAdesoes(); // Carrega as adesões do client
  }

  /**
   * Carrega as adesões do client a partir do serviço.
   */
  private loadAdesoes(): void {
    if (!this.client || !this.client.id) {
      console.error('client inválido.');
      return;
    }

    this.isLoading = true;
    this.fichaAdesaoService
      .listarAdesoesPorclient(this.client.id)
      .subscribe({
        next: (data: PropostaAdesao[]) => {
          this.adesoes = data;
          this.isLoading = false;
        },
        error: (error: unknown) => {
          console.error('Erro ao carregar adesões:', error);
          this.isLoading = false;
        },
      });
  }

  /**
   * Fecha o modal de detalhes.
   */
  closeModal(): void {
    this.modalController.dismiss();
  }
}
