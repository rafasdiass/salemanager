import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumoService } from 'src/app/shared/services/resumo.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { Resumo } from 'src/app/shared/models/resumo.model';
import {
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonSpinner,
  IonTitle,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { NavbarPageAdmin } from '../navbar-admin/navbar-admin.page';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.page.html',
  styleUrls: ['./dashboard-admin.page.scss'],
  standalone: true,
  imports: [
    IonRouterOutlet,
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonButton,
    IonCardHeader,
    IonCardContent,
    IonSpinner,
    IonTitle,
    NavbarPageAdmin,
  ],
})
export class DashboardAdminPage implements OnInit {
  resumo: Resumo | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private readonly resumoService: ResumoService,
    private readonly navigationService: NavigationService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const data = await this.resumoService.getResumoAdmin();
      this.isLoading = false;

      if (data) {
        this.resumo = {
          usuarioLogado: data.usuarioLogado,
          adminResumo: data.adminResumo
            ? {
                totalclients: data.adminResumo.totalclients,
                totalemployees: data.adminResumo.totalemployees,
                clientsAtivos: data.adminResumo.clientsAtivos,
                employeesAtivos: data.adminResumo.employeesAtivos,
                novosclients: data.adminResumo.novosclients,
                novosemployees: data.adminResumo.novosemployees,
                adesoes: data.adminResumo.adesoes,
              }
            : undefined,
          employeeResumo: data.employeeResumo
            ? {
                totalPropostas: data.employeeResumo.totalPropostas,
                propostasPendentes: data.employeeResumo.propostasPendentes,
                historicoPropostas: data.employeeResumo.historicoPropostas,
              }
            : undefined,
          clientResumo: data.clientResumo || undefined,
          adesoesResumo: data.adesoesResumo
            ? {
                total: data.adesoesResumo.total,
                aprovadas: data.adesoesResumo.aprovadas,
                pendentes: data.adesoesResumo.pendentes,
                rejeitadas: data.adesoesResumo.rejeitadas,
                detalhes: data.adesoesResumo.detalhes,
              }
            : undefined,
          pagamentosResumo: data.pagamentosResumo
            ? {
                totalRealizados: data.pagamentosResumo.totalRealizados,
                totalPendentes: data.pagamentosResumo.totalPendentes,
                totalCancelados: data.pagamentosResumo.totalCancelados,
                historicoPagamentos: data.pagamentosResumo.historicoPagamentos,
              }
            : undefined,
        };
      } else {
        // Se data for null, podemos definir alguma mensagem ou estado
        this.resumo = null;
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar dados do dashboard:', error);
      this.isLoading = false;
      this.errorMessage =
        'Erro ao carregar os dados. Por favor, tente novamente mais tarde.';
      this.resumo = null;
    }
  }

  navigateTo(path: string): void {
    this.navigationService.navigateTo(path);
  }

  get adminResumo() {
    return this.resumo?.adminResumo;
  }

  get pagamentosResumo() {
    return this.resumo?.pagamentosResumo;
  }

  get clientResumo() {
    return this.resumo?.clientResumo;
  }

  get employeeResumo() {
    return this.resumo?.employeeResumo;
  }

  get adesoesResumo() {
    return this.resumo?.adesoesResumo;
  }
}
