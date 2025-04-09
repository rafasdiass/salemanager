import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { HistoricoPagamento } from '../models/pagamento.model';

/**
 * Serviço especializado em operações de pagamentos (CRUD).
 */
@Injectable({
  providedIn: 'root',
})
export class PagamentoService {
  private readonly endpoint = 'pagamentos'; // /pagamentos

  constructor(private apiService: ApiService) {}

  /**
   * Obtém todos os pagamentos do servidor.
   */
  obterTodosPagamentos(): Observable<HistoricoPagamento[]> {
    return this.apiService.get<HistoricoPagamento[]>(this.endpoint);
  }

  /**
   * Obtém pagamentos por status (realizado, pendente, atrasado, cancelado).
   */
  obterPagamentosPorStatus(status: string): Observable<HistoricoPagamento[]> {
    return this.obterTodosPagamentos().pipe(
      map((pagamentos) => pagamentos.filter((p) => p.status === status))
    );
  }

  /**
   * Atualiza o status de um pagamento específico.
   */
  atualizarStatusPagamento(
    id: string,
    novoStatus: HistoricoPagamento['status']
  ): Observable<HistoricoPagamento> {
    return this.apiService.put<HistoricoPagamento>(`${this.endpoint}/${id}`, {
      status: novoStatus,
    });
  }

  /**
   * Simula o pagamento de um boleto.
   * (equivale a atualizar status para "realizado")
   */
  realizarPagamento(id: string): Observable<HistoricoPagamento> {
    return this.atualizarStatusPagamento(id, 'realizado');
  }

  /**
   * Cancela um pagamento (atualiza status para "cancelado").
   */
  cancelarPagamento(id: string): Observable<HistoricoPagamento> {
    return this.atualizarStatusPagamento(id, 'cancelado');
  }

  /**
   * Atualiza a data de vencimento de um pagamento.
   */
  atualizarDataVencimento(
    id: string,
    novaData: string
  ): Observable<HistoricoPagamento> {
    return this.apiService.put<HistoricoPagamento>(`${this.endpoint}/${id}`, {
      vencimento: novaData,
    });
  }
}
