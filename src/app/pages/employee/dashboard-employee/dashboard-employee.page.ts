import { Component, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Venda } from 'src/app/shared/models/venda.model';
import { VendaService } from 'src/app/shared/services/venda.service';

@Component({
  selector: 'app-dashboard-employee',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './dashboard-employee.page.html',
  styleUrls: ['./dashboard-employee.page.scss'],
})
export class DashboardEmployeePage {
  private readonly auth = inject(AuthService);
  private readonly vendaService = inject(VendaService);

  /** Usuário autenticado */
  readonly user = this.auth.user; // computed<AuthenticatedUser | null>

  /** Lista de vendas feitas pelo funcionário */
  private readonly _vendas = signal<Venda[]>([]);
  readonly vendasRecentes = computed(() => this._vendas());

  /** Total de vendas realizadas */
  readonly totalVendas = computed(() => this.vendasRecentes().length);

  constructor() {
    effect(() => {
      const employeeId = this.user()?.id;
      if (employeeId) {
        const list = this.vendaService.getVendasByEmployee(employeeId);
        this._vendas.set(list);
      } else {
        this._vendas.set([]);
      }
    });
  }

  /** Faz logout e limpa sessão */
  logout(): void {
    this.auth.logout();
  }
}
