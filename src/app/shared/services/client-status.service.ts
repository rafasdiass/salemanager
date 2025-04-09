import { Injectable, WritableSignal, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Resumo } from '../models/resumo.model';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class clientstatusService {
  private readonly endpoint = 'clients/status';

  public progressoPagamento: WritableSignal<number> = signal(0);
  public parcelasPagas: WritableSignal<number> = signal(0);
  public totalParcelas: WritableSignal<number> = signal(0);
  public valorPago: WritableSignal<number> = signal(0);
  public valorTotal: WritableSignal<number> = signal(0);

  public isLoading: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string | null> = signal(null);
  public hasData: WritableSignal<boolean> = signal(false);

  private apiService = inject(ApiService);

  constructor() {}

  /**
   * Carrega o status da propriedade do client e atualiza os signals.
   * @param clientId O ID do client.
   */
  loadStatusByclientId(clientId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.apiService.get<Resumo>(`${this.endpoint}/${clientId}`).subscribe({
      next: (resumo) => {
        if (resumo.clientResumo) {
          const { totalPagoComJuros, saldoDevedorComJuros } =
            resumo.clientResumo;

          this.valorPago.set(totalPagoComJuros);
          this.valorTotal.set(totalPagoComJuros + saldoDevedorComJuros);
          this.parcelasPagas.set(
            resumo.clientResumo.propostas.reduce(
              (acc, proposta) => acc + proposta.parcelasObra.parcelasPagas,
              0,
            ),
          );
          this.totalParcelas.set(
            resumo.clientResumo.propostas.reduce(
              (acc, proposta) => acc + proposta.parcelasObra.totalParcelas,
              0,
            ),
          );

          this.progressoPagamento.set(
            Math.round((this.parcelasPagas() / this.totalParcelas()) * 100),
          );

          this.hasData.set(true);
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          console.warn('⚠️ Nenhum status encontrado para este client.');
          this.errorMessage.set(null); // Nenhum erro crítico, apenas sem dados
        } else {
          console.error('Erro ao carregar status da propriedade:', err);
          this.errorMessage.set('Erro ao carregar status da propriedade.');
        }
        this.hasData.set(false);
      },
      complete: () => this.isLoading.set(false),
    });
  }
}
