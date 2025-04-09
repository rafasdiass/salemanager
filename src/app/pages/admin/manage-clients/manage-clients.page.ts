import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { employeeService } from 'src/app/shared/services/employee.service';
import { client } from 'src/app/shared/models/client.model';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonRow,
  IonCol,
  IonGrid,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonText,
} from '@ionic/angular/standalone';
import { IonSearchbar } from '@ionic/angular/standalone';
import { ViewclientDetailsPage } from './view-client-details/view-client-details.page';
import { ApproveclientsPage } from './approve-clients/approve-clients.page';


@Component({
  selector: 'app-manage-clients',
  templateUrl: './manage-clients.page.html',
  styleUrls: ['./manage-clients.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardContent,
    IonRow,
    IonCol,
    IonGrid,
    IonSearchbar,
    ApproveclientsPage
],
  providers: [ModalController],
})
export class ManageclientsPage implements OnInit {
  clients: client[] = [];
  filteredclients: client[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(
    private employeeService: employeeService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.loadclients();
  }

  private loadclients(): void {
    this.isLoading = true;
    this.employeeService.listarclients().subscribe({
      next: (data: client[]) => {
        this.clients = data;
        this.filteredclients = [...this.clients];
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar clients:', error);
        this.isLoading = false;
      },
    });
  }

  filterclients(): void {
    const lowerSearch = this.searchTerm.toLowerCase();

    this.filteredclients = this.clients.filter(
      (client) =>
        client.first_name.toLowerCase().includes(lowerSearch) ||
        client.last_name.toLowerCase().includes(lowerSearch) ||
        client.email.toLowerCase().includes(lowerSearch) ||
        client.cpf.includes(this.searchTerm)
    );
  }

  async viewDetails(client: client): Promise<void> {
    const modal = await this.modalController.create({
      component: ViewclientDetailsPage,
      componentProps: { client },
    });
    await modal.present();
  }

  deleteclient(id: string): void {
    if (confirm('Tem certeza que deseja apagar este client?')) {
      this.employeeService.deletarclient(id).subscribe(() => {
        this.loadclients();
      });
    }
  }
}
