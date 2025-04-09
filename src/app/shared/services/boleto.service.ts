import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BoletoResponse } from '../models/pagamento.model';

/**
 * Serviço especializado em operações de boleto.
 */
@Injectable({
  providedIn: 'root',
})
export class BoletoService {
  private readonly endpoint = 'boletos'; // /boletos

  constructor(private apiService: ApiService) {}

  /**
   * Gera um boleto para um client ou pagamento específico.
   */
  gerarBoleto(id: string): Observable<BoletoResponse> {
    return this.apiService.post<BoletoResponse>(`${this.endpoint}/gerar`, {
      id,
    });
  }

  /**
   * Obtém os dados de um boleto já gerado.
   */
  obterBoleto(id: string): Observable<BoletoResponse> {
    return this.apiService.get<BoletoResponse>(`${this.endpoint}/${id}`);
  }
}
