import { Injectable, WritableSignal, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Comissao } from '../models/comissao.model';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComissaoService {
  private readonly endpoint = 'comissao';

  /** Signal para armazenar a comissão do usuário autenticado */
  comissao: WritableSignal<Comissao | null> = signal(null);
  carregando: WritableSignal<boolean> = signal(false);
  erro: WritableSignal<string | null> = signal(null);

  constructor(private apiService: ApiService) {}

  /**
   * Obtém a comissão do employee autenticado e armazena no Signal.
   */
  async calcularComissaoDoUsuario(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const comissao = await lastValueFrom(
        this.apiService.get<Comissao>(`${this.endpoint}/usuario`),
      );
      this.comissao.set(comissao);
    } catch (error) {
      console.error('[ComissaoService] Erro ao calcular comissão:', error);
      this.erro.set('Erro ao carregar comissão. Tente novamente.');
      this.comissao.set(null);
    } finally {
      this.carregando.set(false);
    }
  }

  /**
   * Obtém a comissão de um employee específico pelo ID.
   * @param employeeId string
   */
  async calcularComissaoPoremployee(
    employeeId: string,
  ): Promise<Comissao | null> {
    try {
      return await lastValueFrom(
        this.apiService.get<Comissao>(
          `${this.endpoint}/employee/${employeeId}`,
        ),
      );
    } catch (error) {
      console.error(
        `[ComissaoService] Erro ao obter comissão do employee ${employeeId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Reseta os dados da comissão no serviço.
   */
  resetarComissao(): void {
    this.comissao.set(null);
    this.erro.set(null);
    this.carregando.set(false);
  }
}
