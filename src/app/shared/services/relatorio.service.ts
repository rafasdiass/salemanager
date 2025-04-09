import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResumoService } from './resumo.service';
import { client } from '../models/client.model';
import { employee } from '../models/employee.model';
import { HistoricoPagamento } from '../models/pagamento.model';

/**
 * Estrutura do relatório consolidado para Admin.
 */
interface RelatorioConsolidado {
  totais: {
    totalclients: number;
    totalemployees: number;
    totalPagamentosRealizados: number;
    totalPagamentosPendentes: number;
  };
  novosRegistros: {
    novosclients: Array<
      Pick<client, 'first_name' | 'last_name' | 'registration_date'>
    >;
    novosemployees: Array<
      Pick<employee, 'first_name' | 'last_name' | 'registration_date'>
    >;
  };
  historicoPagamentos: HistoricoPagamento[];
}

/**
 * Estrutura do relatório de adesões.
 */
interface RelatorioAdesoes {
  totalAdesoes: number;
  aprovadas: number;
  pendentes: number;
  rejeitadas: number;
}

@Injectable({
  providedIn: 'root',
})
export class RelatoriosService {
  constructor(private readonly resumoService: ResumoService) {}

  /**
   * Obtém o relatório consolidado para o admin.
   * Converte o Promise<Resumo | null> em Observable usando `from()`.
   */
  getRelatorioConsolidado(): Observable<RelatorioConsolidado> {
    return from(this.resumoService.getResumoAdmin()).pipe(
      map((data) => {
        // Se `data` for null, fornecemos fallback defensivo
        if (!data) {
          return {
            totais: {
              totalclients: 0,
              totalemployees: 0,
              totalPagamentosRealizados: 0,
              totalPagamentosPendentes: 0,
            },
            novosRegistros: {
              novosclients: [],
              novosemployees: [],
            },
            historicoPagamentos: [],
          };
        }

        return {
          totais: {
            totalclients: data.adminResumo?.totalclients || 0,
            totalemployees: data.adminResumo?.totalemployees || 0,
            totalPagamentosRealizados:
              data.pagamentosResumo?.totalRealizados || 0,
            totalPagamentosPendentes:
              data.pagamentosResumo?.totalPendentes || 0,
          },
          novosRegistros: {
            novosclients: data.adminResumo?.novosclients || [],
            novosemployees: data.adminResumo?.novosemployees || [],
          },
          historicoPagamentos: data.pagamentosResumo?.historicoPagamentos || [],
        };
      }),
    );
  }

  /**
   * Obtém um relatório detalhado de adesões.
   * Também converte o Promise<Resumo | null> em Observable usando `from()`.
   */
  getRelatorioAdesoes(): Observable<RelatorioAdesoes> {
    return from(this.resumoService.getResumoAdmin()).pipe(
      map((data) => {
        // Se `data` for null, fornecemos fallback defensivo
        if (!data) {
          return {
            totalAdesoes: 0,
            aprovadas: 0,
            pendentes: 0,
            rejeitadas: 0,
          };
        }

        return {
          totalAdesoes: data.adesoesResumo?.total || 0,
          aprovadas: data.adesoesResumo?.aprovadas || 0,
          pendentes: data.adesoesResumo?.pendentes || 0,
          rejeitadas: data.adesoesResumo?.rejeitadas || 0,
        };
      }),
    );
  }
}
