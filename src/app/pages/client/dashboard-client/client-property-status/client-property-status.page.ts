import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { clientstatusService } from 'src/app/shared/services/client-status.service';
import { clientImagemService } from 'src/app/shared/services/client-imagem.service';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import { AuthenticatedUser } from 'src/app/shared/models/auth.model';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonIcon,
  IonCard,
  IonItem,
  IonLabel,
  IonCardHeader,
  IonCardContent,
  IonList,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-client-property-status',
  templateUrl: './client-property-status.page.html',
  styleUrls: ['./client-property-status.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonCardContent,
    IonCardHeader,
    IonLabel,
    IonItem,
    IonCard,
    IonIcon,
    IonSpinner,
    IonToolbar,
    IonTitle,
    IonHeader,
    IonContent,
    CommonModule,
  ],
})
export class clientPropertyStatusPage implements OnInit {
  public progressoPagamento = signal<number>(0);
  public parcelasPagas = signal<number>(0);
  public totalParcelas = signal<number>(0);
  public valorPago = signal<number>(0);
  public valorTotal = signal<number>(0);

  public isLoading = signal<boolean>(true);
  public errorMessage = signal<string | null>(null);
  public imagens = signal<string[]>([]);
  public hasData = signal<boolean>(false);
  public hasImages = signal<boolean>(false);

  private clientId: string | null = null;
  private statusService = inject(clientstatusService);
  private imagemService = inject(clientImagemService);
  private localStorageService = inject(LocalStorageService);

  constructor() {
    effect(() => {
      console.log(
        '[clientPropertyStatusPage] Imagens atualizadas:',
        this.imagens(),
      );
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadclientId();
    if (this.clientId) {
      this.statusService.loadStatusByclientId(this.clientId);
      this.hasData.set(this.statusService.hasData());

      await this.carregarImagens(this.clientId);
      this.hasImages.set(this.imagemService.hasImages());
    }
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
      console.error('⚠️ client não autenticado ou ID não disponível.');
      this.clientId = null;
    }
  }

  /**
   * Carrega as imagens da cota do client.
   */
  private async carregarImagens(clientId: string): Promise<void> {
    await this.imagemService.loadImagensByclientId(clientId);
    this.imagens.set([...this.imagemService.imagens()]);
    this.hasImages.set(this.imagemService.hasImages());
  }
}
