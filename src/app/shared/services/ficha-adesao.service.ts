import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { PropostaAdesao } from '../models/proposta-adesao.model';

@Injectable({
  providedIn: 'root',
})
export class FichaAdesaoService {
  private readonly endpoint = 'ficha-adesao';

  constructor(private apiService: ApiService) {}

  /**
   * Cria uma nova ficha de adesão.
   * @param adesao Dados da ficha de adesão.
   * @returns Observable com a ficha criada.
   */
  criarFichaAdesao(adesao: PropostaAdesao): Observable<PropostaAdesao> {
    if (!adesao.associado?.id) {
      throw new Error(
        'O client associado é obrigatório para criar uma adesão.'
      );
    }

    return this.apiService
      .get<{ status: string }>(`clients/${adesao.associado.id}/status`)
      .pipe(
        switchMap((client) => {
          if (client.status !== 'aprovado') {
            throw new Error(
              'O client não está aprovado e não pode aderir a uma proposta.'
            );
          }
          return this.apiService.post<PropostaAdesao>(
            `${this.endpoint}`,
            adesao
          );
        })
      );
  }

  listarFichasAdesao(): Observable<PropostaAdesao[]> {
    return this.apiService.get<PropostaAdesao[]>(`${this.endpoint}`);
  }

  /**
   * Lista adesões associadas a um client específico.
   * @param clientId ID do client.
   * @returns Observable com lista de adesões do client.
   */
  listarAdesoesPorclient(clientId: string): Observable<PropostaAdesao[]> {
    return this.apiService.get<PropostaAdesao[]>(
      `${this.endpoint}/client/${clientId}`
    );
  }

  /**
   * Obtém uma ficha de adesão específica por ID.
   * @param id ID da ficha de adesão.
   * @returns Observable com os detalhes da ficha.
   */
  obterFichaAdesaoPorId(id: string): Observable<PropostaAdesao> {
    return this.apiService.get<PropostaAdesao>(`${this.endpoint}/${id}`);
  }

  /**
   * Atualiza uma ficha de adesão.
   * @param id ID da ficha de adesão.
   * @param adesao Dados atualizados da ficha.
   * @returns Observable com a ficha atualizada.
   */
  atualizarFichaAdesao(
    id: string,
    adesao: Partial<PropostaAdesao>
  ): Observable<PropostaAdesao> {
    return this.apiService.put<PropostaAdesao>(
      `${this.endpoint}/${id}`,
      adesao
    );
  }

  /**
   * Deleta uma ficha de adesão por ID.
   * @param id ID da ficha de adesão.
   * @returns Observable indicando a conclusão da operação.
   */
  deletarFichaAdesao(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
