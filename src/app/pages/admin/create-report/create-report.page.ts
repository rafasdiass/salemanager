import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardContent,
} from '@ionic/angular/standalone';
import { RelatoriosService } from 'src/app/shared/services/relatorio.service';
import { client } from 'src/app/shared/models/client.model';
import { employee } from 'src/app/shared/models/employee.model';
import { HistoricoPagamento } from 'src/app/shared/models/pagamento.model';

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.page.html',
  styleUrls: ['./create-report.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
  ],
})
export class CreateReportPage implements OnInit {
  isLoading: boolean = false; // Indica carregamento de dados
  relatorioConsolidado: {
    totais: {
      totalclients: number;
      totalemployees: number;
      totalPagamentosRealizados: number;
      totalPagamentosPendentes: number;
    };
    novosRegistros: {
      novosclients: Array<
        Pick<client, 'first_name' | 'last_name' | 'registration_date'>
      >;
      novosemployees: Array<
        Pick<employee, 'first_name' | 'last_name' | 'registration_date'>
      >;
    };
    historicoPagamentos: HistoricoPagamento[];
  } | null = null; // Dados do relatório consolidado
  erroCarregamento: boolean = false; // Indica erro ao carregar os relatórios

  constructor(private relatoriosService: RelatoriosService) {}

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  /**
   * Carrega os dados consolidados para relatórios.
   */
  carregarRelatorio(): void {
    this.isLoading = true;
    this.relatoriosService.getRelatorioConsolidado().subscribe({
      next: (data) => {
        this.relatorioConsolidado = data;
        this.isLoading = false;
      },
      error: () => {
        this.erroCarregamento = true;
        this.isLoading = false;
      },
    });
  }
}
