import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { NavigationService } from 'src/app/shared/services/navigation.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EstablishmentService } from 'src/app/shared/services/establishment.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { ClientService } from 'src/app/shared/services/client.service';
import { VendaService } from 'src/app/shared/services/venda.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './dashboard-admin.page.html',
  styleUrls: ['./dashboard-admin.page.scss'],
})
export class DashboardAdminPage {
  private readonly auth = inject(AuthService);
  private readonly nav = inject(NavigationService);
  private readonly alertCtrl = inject(AlertController);

  private readonly estSrv = inject(EstablishmentService);
  private readonly empSrv = inject(EmployeeService);
  private readonly cliSrv = inject(ClientService);
  private readonly vendaSrv = inject(VendaService);

  /** Empresa atual */
  readonly company = this.estSrv.company;

  /** Funcionários */
  readonly employees = this.empSrv.employees;

  /** Clientes */
  readonly clients = this.cliSrv.filteredClients;

  /** Vendas */
  readonly vendas = this.vendaSrv.vendas;

  /** Totais para os cards */
  readonly totalEmployees = computed(() => this.employees().length);
  readonly totalClients = computed(() => this.clients().length);
  readonly totalVendas = computed(() => this.vendas().length);
  readonly totalReceita = computed(() =>
    this.vendas().reduce((acc, venda) => acc + venda.valorTotal, 0)
  );

  /** Cards principais */
  readonly cards = computed(() => [
    { title: 'Clientes', value: this.totalClients() },
    { title: 'Funcionários', value: this.totalEmployees() },
    { title: 'Vendas', value: this.totalVendas() },
    { title: 'Receita', value: `R$ ${this.totalReceita().toFixed(2)}` },
  ]);

  constructor() {
    // Mantém os sinais ativos para reatividade
    effect(() => {
      this.company();
      this.cards();
      this.employees();
      this.clients();
      this.vendas();
    });
  }

  /** Faz logout */
  logout(): void {
    this.auth.logout();
  }

  /** Botões de ação do Admin */
  onAddEmployee(): void {
    this.nav.navigateTo('/employees/new');
  }

  onAddClient(): void {
    this.nav.navigateTo('/clients/new');
  }

  onAddVenda(): void {
    this.nav.navigateTo('/vendas/new');
  }
}
