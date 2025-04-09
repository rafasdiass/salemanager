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
  IonSpinner, IonCard, IonCardContent, IonCardHeader, IonList, IonItem, IonLabel, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { client } from 'src/app/shared/models/client.model';
import { FichaAdesaoService } from 'src/app/shared/services/ficha-adesao.service';
import { PropostaAdesao } from 'src/app/shared/models/proposta-adesao.model';

@Component({
  selector: 'app-view-client-details',
  templateUrl: './view-client-details.page.html',
  styleUrls: ['./view-client-details.page.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonLabel, IonItem, IonList, IonCardHeader, IonCardContent, IonCard, 
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
  @Input() client: client | null = null; // Inicializando como null para evitar erro de template
  adesoes: PropostaAdesao[] = []; // Lista de adesões do client
  isLoading: boolean = false; // Estado de carregamento

  constructor(
    private fichaAdesaoService: FichaAdesaoService, // Serviço correto
    private modalController: ModalController,
  ) {}

  ngOnInit(): void {
    if (!this.client) {
      console.error('[ViewclientDetailsPage] ❌ client não definido.');
      return;
    }
    this.loadAdesoes(); // Carrega as adesões do client
  }

  /**
   * **Carrega as adesões do client a partir do serviço.**
   */
  private loadAdesoes(): void {
    if (!this.client?.id) {
      console.error(
        '[ViewclientDetailsPage] ❌ ID do client não informado.',
      );
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
          console.error(
            '[ViewclientDetailsPage] ❌ Erro ao carregar adesões:',
            error,
          );
          this.isLoading = false;
        },
      });
  }

  /**
   * **Fecha o modal de detalhes.**
   */
  closeModal(): void {
    this.modalController.dismiss();
  }
}
