import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthState } from '../models/auth.model';
import { HistoricoPagamento } from '../models/pagamento.model';
import { Configuracoes } from '../models/configuracoes.model';
import { PropostaAdesao } from '../models/proposta-adesao.model';
import { PagamentoService } from './pagamento.service';

/**
 * Serviço para cálculos e resumos financeiros (sem CRUD direto).
 * Pode chamar PagamentoService para obter dados, mas não duplica endpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class FinanceiroService {
  private authState!: AuthState;

  constructor(private pagamentoService: PagamentoService) {}

  /**
   * Define o estado de autenticação atual, usado para verificar permissões.
   */
  setAuthState(authState: AuthState): void {
    this.authState = authState;
  }

  /**
   * Obtém um resumo financeiro do client (ou global),
   * chamando o PagamentoService apenas para obter todos os pagamentos.
   */
  obterResumoFinanceiro(): Observable<{
    totalPago: number;
    saldoDevedor: number;
    totalParcelas: number;
  }> {
    // Em vez de duplicar "this.apiService.get", chamamos o pagamentoService.
    return this.pagamentoService.obterTodosPagamentos().pipe(
      map((pagamentos: HistoricoPagamento[]) => {
        const totalPago = pagamentos
          .filter((p) => p.status === 'realizado')
          .reduce((acc, p) => acc + p.valor, 0);

        const saldoDevedor = pagamentos
          .filter((p) => p.status === 'pendente' || p.status === 'atrasado')
          .reduce((acc, p) => acc + p.valor, 0);

        return {
          totalPago,
          saldoDevedor,
          totalParcelas: pagamentos.length,
        };
      })
    );
  }

  /**
   * Calcula o saldo restante (sem juros) de um valor total menos o valor já pago.
   */
  calcularSaldoRestante(valorAdesao: number, valorPago: number): number {
    return valorAdesao - valorPago;
  }

  /**
   * Calcula o valor corrigido pelo INCC com base nas configurações.
   */
  calcularValorCorrigidoPeloIncc(configuracoes: Configuracoes): number {
    this.verificarPermissaoAdmin();

    if (!configuracoes.usarIncc || configuracoes.indiceIncc <= 0) {
      return configuracoes.parcelasObra.valorBase;
    }
    const fatorCorrecao = 1 + configuracoes.indiceIncc / 100;
    return configuracoes.parcelasObra.valorBase * fatorCorrecao;
  }

  /**
   * Atualiza o valor corrigido das parcelas de obra.
   */
  atualizarParcelas(configuracoes: Configuracoes): Configuracoes {
    this.verificarPermissaoAdmin();

    const valorCorrigido = this.calcularValorCorrigidoPeloIncc(configuracoes);
    return {
      ...configuracoes,
      parcelasObra: {
        ...configuracoes.parcelasObra,
        valorCorrigido,
      },
    };
  }

  /**
   * Aplica ajuste de juros/INCC para múltiplas propostas de adesão.
   * Exemplo de lógica que reusa "calcularValorCorrigidoPeloIncc".
   */
  ajustarPropostas(
    propostas: PropostaAdesao[],
    configuracoes: Configuracoes
  ): PropostaAdesao[] {
    this.verificarPermissaoAdmin();

    return propostas.map((proposta) => ({
      ...proposta,
      valorCorrigido: this.calcularValorCorrigidoPeloIncc(configuracoes),
    }));
  }

  /**
   * Verifica se o usuário tem permissão ADMIN para executar ações.
   */
  private verificarPermissaoAdmin(): boolean {
    if (this.authState?.user?.role !== 'ADMIN') {
      throw new Error(
        `Acesso negado: somente usuários com o papel 'ADMIN' podem realizar esta operação.`
      );
    }
    return true;
  }
}
