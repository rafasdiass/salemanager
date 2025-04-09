import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Beneficio,
  BeneficioAdmin,
  Beneficioclient,
} from '../models/beneficio.model';

@Injectable({
  providedIn: 'root',
})
export class BeneficioService {
  private readonly endpoint = 'beneficios';

  constructor(private apiService: ApiService) {}

  /**
   * Lista todos os benefícios para administração.
   * @returns Observable<BeneficioAdmin[]> com a lista de benefícios detalhados.
   */
  listarBeneficiosAdmin(): Observable<BeneficioAdmin[]> {
    return this.apiService.get<BeneficioAdmin[]>(`${this.endpoint}/admin`);
  }

  /**
   * Lista benefícios disponíveis para o client.
   * @returns Observable<Beneficioclient[]> com os benefícios disponíveis.
   */
  listarBeneficiosclient(): Observable<Beneficioclient[]> {
    return this.apiService.get<Beneficioclient[]>(`clients/beneficios`);
  }

  /**
   * Busca um benefício pelo ID (Admin).
   * @param id ID do benefício.
   * @returns Observable<BeneficioAdmin> com os dados detalhados.
   */
  obterBeneficioPorId(id: string): Observable<BeneficioAdmin> {
    return this.apiService.get<BeneficioAdmin>(`${this.endpoint}/${id}`);
  }

  /**
   * Cadastra um novo benefício.
   * @param beneficio Dados do benefício a ser cadastrado.
   * @returns Observable<BeneficioAdmin> com os dados do benefício criado.
   */
  cadastrarBeneficio(
    beneficio: Partial<BeneficioAdmin>
  ): Observable<BeneficioAdmin> {
    return this.apiService.post<BeneficioAdmin>(`${this.endpoint}`, beneficio);
  }

  /**
   * Atualiza um benefício existente.
   * @param id ID do benefício.
   * @param beneficio Dados atualizados do benefício.
   * @returns Observable<BeneficioAdmin> com os dados atualizados.
   */
  atualizarBeneficio(
    id: string,
    beneficio: Partial<BeneficioAdmin>
  ): Observable<BeneficioAdmin> {
    return this.apiService.put<BeneficioAdmin>(
      `${this.endpoint}/${id}`,
      beneficio
    );
  }

  /**
   * Exclui um benefício pelo ID.
   * @param id ID do benefício.
   * @returns Observable<void> indicando sucesso ou falha.
   */
  deletarBeneficio(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Associa um benefício a um client.
   * @param clientId ID do client.
   * @param beneficioId ID do benefício a ser associado.
   * @returns Observable<void> indicando sucesso ou falha.
   */
  associarBeneficioAoclient(
    clientId: string,
    beneficioId: string
  ): Observable<void> {
    return this.apiService.post<void>(
      `clients/${clientId}/associar-beneficio`,
      { beneficioId }
    );
  }

  /**
   * Desassocia um benefício de um client.
   * @param clientId ID do client.
   * @param beneficioId ID do benefício a ser desassociado.
   * @returns Observable<void> indicando sucesso ou falha.
   */
  desassociarBeneficioDoclient(
    clientId: string,
    beneficioId: string
  ): Observable<void> {
    return this.apiService.delete<void>(
      `clients/${clientId}/beneficios/${beneficioId}`
    );
  }
}
