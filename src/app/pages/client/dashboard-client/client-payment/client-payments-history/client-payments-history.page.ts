import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagamentoService } from 'src/app/shared/services/pagamento.service';
import { HistoricoPagamento } from 'src/app/shared/models/pagamento.model';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-client-payments-history',
  templateUrl: './client-payments-history.page.html',
  styleUrls: ['./client-payments-history.page.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class clientPaymentsHistoryPage implements OnInit {
  pagamentos: HistoricoPagamento[] = []; // Historico de pagamentos
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private readonly pagamentoService: PagamentoService) {}

  ngOnInit(): void {
    this.carregarPagamentos();
  }

  /**
   * Carrega todo o histórico de pagamentos do client.
   */
  private carregarPagamentos(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.pagamentoService
      .obterTodosPagamentos()
      .pipe(
        tap((data) => (this.pagamentos = data)),
        catchError((err) => {
          console.error('Erro ao carregar histórico de pagamentos:', err);
          this.errorMessage = 'Erro ao carregar o histórico de pagamentos.';
          this.pagamentos = [];
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  /**
   * Atualiza a data de vencimento de um pagamento.
   */
  atualizarVencimento(pagamento: HistoricoPagamento, novaData: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Aqui assumimos que o backend espera o ID do client como "chave" do pagamento.
    // Se for necessário o ID real do pagamento, ajuste conforme seu model/endpoint.
    this.pagamentoService
      .atualizarDataVencimento(pagamento.client.id, novaData)
      .subscribe({
        next: () => {
          this.successMessage = `Vencimento atualizado para ${novaData} com sucesso!`;
          this.carregarPagamentos(); // Atualiza a lista
        },
        error: (err) => {
          console.error('Erro ao atualizar data de vencimento:', err);
          this.errorMessage =
            'Erro ao atualizar a data de vencimento. Tente novamente.';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  /**
   * Formata datas (YYYY-MM-DD) para DD/MM/YYYY.
   */
  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}
