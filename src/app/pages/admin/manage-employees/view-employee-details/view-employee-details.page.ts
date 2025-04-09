import {
  Component,
  Input,
  OnInit,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { employee } from 'src/app/shared/models/employee.model';
import { AdminService } from 'src/app/shared/services/admin.service';
import {
  IonContent,
  IonSpinner,
  IonTitle,
  IonIcon,
  IonButtons,
  IonButton,
  IonToolbar,
  IonHeader,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonFooter,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-view-employee-details',
  templateUrl: './view-employee-details.page.html',
  styleUrls: ['./view-employee-details.page.scss'],
  standalone: true,
  imports: [
    IonFooter,
    IonHeader,
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonTitle,
    IonSpinner,
    IonContent,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    CommonModule,
    FormsModule,
  ],
})
export class ViewemployeeDetailsPage implements OnInit {
  @Input() employee!: employee;

  private adminService = inject(AdminService);
  private modalController = inject(ModalController);

  isLoading = signal<boolean>(true);
  employeeSelecionado: Signal<employee | null> =
    this.adminService.employeeSelecionado;

  async ngOnInit(): Promise<void> {
    await this.loademployeeDetails();
  }

  /**
   * 🔹 Carrega os detalhes do employee a partir do serviço
   */
  private async loademployeeDetails(): Promise<void> {
    if (!this.employee || !this.employee.id) {
      console.error('❌ employee inválido.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.adminService.obteremployeePorId(this.employee.id);
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do employee:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  closeModal(): void {
    this.modalController.dismiss();
  }
}
