import { Injectable } from '@angular/core';

export interface Configuracaoemployee {
  nome: string;
  email: string;
  telefone: string;
  alertasComissao: boolean;
  notificacoesGerais: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigemployeeService {
  private configuracoes: Configuracaoemployee = {
    nome: '',
    email: '',
    telefone: '',
    alertasComissao: false,
    notificacoesGerais: false,
  };

  constructor() {}

  /**
   * Obtém as configurações atuais do employee.
   * @returns {Configuracaoemployee} As configurações do employee.
   */
  obterConfiguracoes(): Configuracaoemployee {
    return { ...this.configuracoes };
  }

  /**
   * Atualiza as configurações do employee.
   * @param novasConfiguracoes Novos valores das configurações.
   */
  atualizarConfiguracoes(novasConfiguracoes: Configuracaoemployee): void {
    this.configuracoes = { ...novasConfiguracoes };
    console.log('📌 Configurações atualizadas:', this.configuracoes);
  }
}
