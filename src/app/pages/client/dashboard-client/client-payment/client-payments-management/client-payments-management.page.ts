import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import {
  HistoricoPagamento,
  BoletoResponse,
} from 'src/app/shared/models/pagamento.model';
import { PagamentoService } from 'src/app/shared/services/pagamento.service';
import { BoletoService } from 'src/app/shared/services/boleto.service';

@Component({
  selector: 'app-client-payments-management',
  templateUrl: './client-payments-management.page.html',
  styleUrls: ['./client-payments-management.page.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class clientPaymentsManagementPage implements OnInit {
  pagamentosPendentesAtrasados$: Observable<HistoricoPagamento[]> = of([]);
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private readonly pagamentoService: PagamentoService,
    private readonly boletoService: BoletoService
  ) {}

  ngOnInit(): void {
    this.carregarPagamentosPendentesAtrasados();
  }

  /**
   * Carrega os pagamentos com status 'pendente' (ou 'atrasado', se quiser unificar) do client.
   */
  private carregarPagamentosPendentesAtrasados(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Agora chamamos pagamentoService ao invés de financeiroService
    this.pagamentosPendentesAtrasados$ =
      this.pagamentoService.obterPagamentosPorStatus('pendente');

    this.pagamentosPendentesAtrasados$
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        error: (err) => {
          console.error('Erro ao carregar pagamentos:', err);
          this.errorMessage =
            'Erro ao carregar pagamentos pendentes ou atrasados.';
        },
      });
  }

  /**
   * Gera um boleto para o pagamento pendente/atrasado.
   */
  async gerarBoleto(pagamento: HistoricoPagamento): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      // Agora chamamos boletoService para gerar o boleto
      const boleto = await this.boletoService
        .gerarBoleto(pagamento.client.id)
        .toPromise();

      if (!boleto) {
        throw new Error('Boleto não gerado. Tente novamente mais tarde.');
      }

      this.successMessage = `Boleto gerado com sucesso! Vencimento: ${
        boleto.vencimento
      }, Valor: R$ ${boleto.valor.toFixed(2)}`;

      // Abre o boleto em nova aba
      window.open(boleto.url, '_blank');
    } catch (error) {
      console.error('Erro ao gerar boleto:', error);
      this.errorMessage = 'Erro ao gerar o boleto. Por favor, tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }
}
