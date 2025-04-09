import {
  Component,
  OnInit,
  inject,
  Signal,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
} from '@ionic/angular/standalone';
import { AdminService } from 'src/app/shared/services/admin.service';
import { client } from 'src/app/shared/models/client.model';

@Component({
  selector: 'app-approve-clients',
  templateUrl: './approve-clients.page.html',
  styleUrls: ['./approve-clients.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class ApproveclientsPage implements OnInit {
  private adminService = inject(AdminService);

  // 🟢 Acessamos diretamente os Signals do serviço
  clientsPendentes: Signal<client[]> =
    this.adminService.clientsPendentes;
  isLoading = signal<boolean>(true);

  // 🔹 Propriedade que converte Signal para um formato aceito pelo *ngFor
  readonlyclientsPendentes = computed(() => this.clientsPendentes());

  async ngOnInit(): Promise<void> {
    await this.loadPendingclients();
  }

  /**
   * 🟢 Carrega os clients pendentes de aprovação
   */
  public async loadPendingclients(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.adminService.carregarclientsPendentes();
    } catch (error) {
      console.error('❌ Erro ao carregar clients pendentes:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 🟢 Aprova o client e atualiza a lista.
   */
  public async approveclient(client: client): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.adminService.aprovarclient(client.id);
    } catch (error) {
      console.error('❌ Erro ao aprovar client:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 🟢 Rejeita o client e atualiza a lista.
   */
  public async rejectclient(client: client): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.adminService.rejeitarclient(client.id);
    } catch (error) {
      console.error('❌ Erro ao rejeitar client:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
