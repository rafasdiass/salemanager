import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumoService } from 'src/app/shared/services/resumo.service';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { Resumo } from 'src/app/shared/models/resumo.model';
import {
  IonContent,
  IonSpinner,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonTitle,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { NavbaremployeePage } from '../navbar-employee/navbar-employee.page';

@Component({
  selector: 'app-dashboard-employee',
  templateUrl: './dashboard-employee.page.html',
  styleUrls: ['./dashboard-employee.page.scss'],
  standalone: true,
  imports: [
    IonRouterOutlet,
    CommonModule,
    FormsModule,
    IonContent,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonTitle,
    NavbaremployeePage, // Navbar do employee
  ],
})
export class DashboardemployeePage implements OnInit {
  resumo: Resumo | null = null; // Dados do resumo
  isLoading = false; // Indica carregamento
  errorMessage: string | null = null; // Mensagem de erro

  constructor(
    private readonly resumoService: ResumoService,
    private readonly navigationService: NavigationService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carrega dados do painel employee via serviço, usando Signals.
   */
  async loadDashboardData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      // Atualiza o Signal do resumo com dados do employee
      await this.resumoService.getResumoAdmin();

      // Lê o valor atual do signal
      const data = this.resumoService.getResumo();
      this.resumo = data || null;
    } catch (error: unknown) {
      console.error('Erro ao carregar dados do dashboard:', error);
      this.errorMessage =
        'Erro ao carregar os dados. Por favor, tente novamente mais tarde.';
      this.resumo = null;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Navega para uma rota específica usando o serviço de navegação.
   * @param path Caminho da rota filha.
   */
  navigateTo(path: string): void {
    try {
      this.navigationService.navigateTo(path);
    } catch (error: unknown) {
      console.error(`Erro ao navegar para a rota: ${path}`, error);
    }
  }
}
