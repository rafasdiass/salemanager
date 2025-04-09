import { Injectable } from '@angular/core';
import { Configuracoes } from '../models/configuracoes.model';
import { FinanceiroService } from './fincanceiro.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private configuracoes: Configuracoes = {
    usarIncc: false,
    indiceIncc: 0,
    dataBaseIncc: new Date(),
    parcelasObra: {
      valorBase: 0,
      totalParcelas: 0,
      parcelasPagas: 0,
      parcelasRestantes: 0,
    },
    retirarJuros: false, // Inicializa com o valor padrão
  };

  constructor(private financeiroService: FinanceiroService) {}

  /**
   * Obtém as configurações atuais.
   * @returns {Configuracoes} As configurações atuais.
   */
  obterConfiguracoes(): Configuracoes {
    return this.configuracoes;
  }

  /**
   * Atualiza as configurações com novos valores e recalcula os valores financeiros.
   * @param configuracoes Novas configurações.
   */
  atualizarConfiguracoes(configuracoes: Configuracoes): void {
    // Salva as configurações localmente
    this.configuracoes = configuracoes;

    // Recalcula os valores financeiros com base nas novas configurações
    this.configuracoes = this.financeiroService.atualizarParcelas(
      this.configuracoes
    );
  }
}
