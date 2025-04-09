import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { PagamentoService } from 'src/app/shared/services/pagamento.service';
import { HistoricoPagamento } from 'src/app/shared/models/pagamento.model';

@Component({
  selector: 'app-pagamentos',
  templateUrl: './pagamentos.page.html',
  styleUrls: ['./pagamentos.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class PagamentosPage implements OnInit {
  pagamentosAReceber: HistoricoPagamento[] = [];
  pagamentosRealizados: HistoricoPagamento[] = [];
  pagamentosAtrasados: HistoricoPagamento[] = [];
  pagamentosCancelados: HistoricoPagamento[] = [];

  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private pagamentoService: PagamentoService) {}

  ngOnInit(): void {
    this.carregarPagamentos();
  }

  /**
   * Carrega os diferentes tipos de pagamentos do sistema.
   */
  carregarPagamentos(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Pagamentos a receber (pendente)
    this.pagamentoService.obterPagamentosPorStatus('pendente').subscribe({
      next: (data: HistoricoPagamento[]) => (this.pagamentosAReceber = data),
      error: (err) => {
        console.error('Erro ao carregar pagamentos a receber:', err);
        this.errorMessage = 'Erro ao carregar pagamentos a receber.';
      },
    });

    // Pagamentos realizados
    this.pagamentoService.obterPagamentosPorStatus('realizado').subscribe({
      next: (data: HistoricoPagamento[]) => (this.pagamentosRealizados = data),
      error: (err) => {
        console.error('Erro ao carregar pagamentos realizados:', err);
        this.errorMessage = 'Erro ao carregar pagamentos realizados.';
      },
    });

    // Pagamentos atrasados
    this.pagamentoService.obterPagamentosPorStatus('atrasado').subscribe({
      next: (data: HistoricoPagamento[]) => (this.pagamentosAtrasados = data),
      error: (err) => {
        console.error('Erro ao carregar pagamentos atrasados:', err);
        this.errorMessage = 'Erro ao carregar pagamentos atrasados.';
      },
    });

    // Pagamentos cancelados
    this.pagamentoService.obterPagamentosPorStatus('cancelado').subscribe({
      next: (data: HistoricoPagamento[]) => (this.pagamentosCancelados = data),
      error: (err) => {
        console.error('Erro ao carregar pagamentos cancelados:', err);
        this.errorMessage = 'Erro ao carregar pagamentos cancelados.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  /**
   * Verifica se um pagamento vence nos próximos 7 dias.
   */
  isProximoVencimento(pagamento: HistoricoPagamento): boolean {
    const hoje = new Date();
    const vencimento = new Date(pagamento.vencimento);
    const diferencaDias =
      (vencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24);

    return diferencaDias > 0 && diferencaDias <= 5; // Se faltam <= 5 dias para o vencimento
  }
}
