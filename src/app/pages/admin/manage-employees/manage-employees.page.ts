import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AdminService } from 'src/app/shared/services/admin.service';
import { employee } from 'src/app/shared/models/employee.model';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonCard,
  IonItem,
  IonLabel,
  IonSpinner,
  IonList,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonRow,
  IonCol,
  IonText,
  IonGrid,
} from '@ionic/angular/standalone';
import { ViewemployeeDetailsPage } from './view-employee-details/view-employee-details.page';
import { CreateemployeePage } from './create-employee/create-employee.page';
import { ComissaoAdminPage } from './comissao-admin/comissao-admin.page';

@Component({
  selector: 'app-manage-employees',
  templateUrl: './manage-employees.page.html',
  styleUrls: ['./manage-employees.page.scss'],
  standalone: true,
  imports: [
    IonGrid,
    IonText,
    IonCol,
    IonRow,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonList,
    IonSpinner,
    IonLabel,
    IonItem,
    IonCard,
    IonIcon,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    FormsModule,
    IonContent,
  ],
  providers: [ModalController],
})
export class ManageemployeesPage implements OnInit {
  employees = this.adminService.employees; // Signal que armazena os employees
  filteredemployees: employee[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  // 🔹 Variável para armazenar a soma do desempenho de todos os employees
  desempenhoTotal = {
    totalclients: 0,
    totalAdesoes: 0,
    totalPendentes: 0,
    totalAprovadas: 0,
  };

  constructor(
    private adminService: AdminService,
    private modalController: ModalController,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loademployees();
  }

  private async loademployees(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('📡 Solicitando lista de employees da API...');

    try {
      await this.adminService.listaremployees();
      this.filteredemployees = [...this.employees()];
      console.log(
        `✅ ${this.filteredemployees.length} employees carregados com sucesso.`,
      );
      await this.enriqueceremployeesComDetalhes();
    } catch (error) {
      console.error('❌ Erro ao carregar employees:', error);
      this.errorMessage = 'Erro ao carregar a lista de employees.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 🔹 Obtém os detalhes de cada employee para adicionar CPF e nome à lista principal.
   */
  private async enriqueceremployeesComDetalhes(): Promise<void> {
    console.log(
      `📡 Buscando detalhes para ${this.employees().length} employees...`,
    );

    for (const employee of this.employees()) {
      try {
        await this.adminService.obteremployeePorId(employee.id);
      } catch (error) {
        console.error(
          `❌ Erro ao buscar detalhes do employee ID ${employee.id}:`,
          error,
        );
      }
    }

    this.filteredemployees = [...this.employees()];
    console.log('✅ Todos os detalhes foram adicionados à lista.');
  }

  async filteremployees(): Promise<void> {
    console.log(`🔍 Filtrando employees com termo: "${this.searchTerm}"`);

    const lowerSearch = this.searchTerm.toLowerCase();

    this.filteredemployees = this.employees().filter((employee) => {
      const firstName = employee.first_name?.toLowerCase() || '';
      const lastName = employee.last_name?.toLowerCase() || '';
      const email = employee.email?.toLowerCase() || '';
      const cpf = employee.cpf || '';

      return (
        firstName.includes(lowerSearch) ||
        lastName.includes(lowerSearch) ||
        email.includes(lowerSearch) ||
        cpf.includes(this.searchTerm)
      );
    });

    console.log(
      `🔎 ${this.filteredemployees.length} employees encontrados após filtragem.`,
    );
  }

  async viewDetails(employee: employee): Promise<void> {
    console.log(`🧐 Visualizando detalhes do employee ID: ${employee.id}`);

    const modal = await this.modalController.create({
      component: ViewemployeeDetailsPage,
      componentProps: { employee },
    });
    await modal.present();
  }

  async createNewemployee(): Promise<void> {
    console.log('➕ Criando novo employee...');

    const modal = await this.modalController.create({
      component: CreateemployeePage,
      componentProps: { employee: null },
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data?.updated) {
      console.log('✅ Novo employee criado, recarregando lista...');
      await this.loademployees();
    }
  }

  async editemployee(employee: employee): Promise<void> {
    console.log(`✏️ Editando employee ID: ${employee.id}`);

    const modal = await this.modalController.create({
      component: CreateemployeePage,
      componentProps: { employee },
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data?.updated) {
      console.log('✅ employee atualizado, recarregando lista...');
      await this.loademployees();
    }
  }

  async deleteemployee(id: string): Promise<void> {
    if (confirm('❌ Tem certeza que deseja apagar este employee?')) {
      console.log(`🗑️ Apagando employee ID: ${id}`);

      try {
        await this.adminService.deletaremployee(id);
        console.log('✅ employee deletado, recarregando lista...');
        await this.loademployees();
      } catch (error) {
        console.error(`❌ Erro ao deletar employee ${id}:`, error);
      }
    }
  }

  async viewComissao(employee: employee): Promise<void> {
    const modal = await this.modalController.create({
      component: ComissaoAdminPage,
      componentProps: { employee },
    });
    await modal.present();
  }
}
