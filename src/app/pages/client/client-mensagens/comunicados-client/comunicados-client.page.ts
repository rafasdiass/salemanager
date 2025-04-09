import { Component, OnInit, signal, effect, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { clientCommunicationsService } from 'src/app/shared/services/client-communications.service';
import { clientservice } from 'src/app/shared/services/client.service';
import { clientCommunication } from 'src/app/shared/models/communication.model';

@Component({
  selector: 'app-comunicados-client',
  templateUrl: './comunicados-client.page.html',
  styleUrls: ['./comunicados-client.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    CommonModule,
    FormsModule,
  ],
})
export class ComunicadosclientPage implements OnInit {
  /**
   * Signal local para armazenar comunicados, inicializado vazio.
   */
  public communications = signal<clientCommunication[]>([]);
  public isLoading = signal<boolean>(true);
  public errorMessage = signal<string | null>(null);

  private clientCommunicationsService = inject(
    clientCommunicationsService,
  );
  private clientservice = inject(clientservice);

  async ngOnInit(): Promise<void> {
    await this.loadCommunications();

    // Cria um effect para reagir às mudanças no signal de comunicados no serviço.
    effect(() => {
      const serviceCommunications =
        this.clientCommunicationsService.communications();
      this.communications.set([...serviceCommunications]); // 🔹 Convertendo para array mutável
    });
  }

  /**
   * Carrega os comunicados do client usando o serviço `clientCommunicationsService`.
   */
  private async loadCommunications(): Promise<void> {
    const clientId = this.clientservice.getCurrentclientId();

    if (!clientId) {
      this.logError('client não autenticado ou ID não disponível.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.clientCommunicationsService.loadAndSetCommunications(
        clientId,
      );

      // 🔹 Garantindo que o estado seja atualizado com um array mutável
      const communications = [
        ...this.clientCommunicationsService.communications(),
      ];

      if (communications.length === 0) {
        this.errorMessage.set('Nenhum comunicado encontrado.');
      }

      this.communications.set(communications);
    } catch (error) {
      this.logError('❌ Erro ao carregar comunicados', error);
      this.errorMessage.set('Erro ao buscar comunicados.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Método utilitário para registrar mensagens de erro.
   */
  private logError(message: string, error?: unknown): void {
    console.error(`[ComunicadosclientPage] ❌ ${message}`, error);
  }
}
