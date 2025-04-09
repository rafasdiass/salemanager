import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { AdminService } from './admin.service';
import { ComissaoService } from './comissao.service';
import { PagamentoService } from './pagamento.service';
import { AuthService } from './auth.service';
import { Resumo } from '../models/resumo.model';
import { HistoricoPagamento } from '../models/pagamento.model';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResumoService {
  private adminService = inject(AdminService);
  private comissaoService = inject(ComissaoService);
  private pagamentoService = inject(PagamentoService);
  private authService = inject(AuthService);

  public resumo: WritableSignal<Resumo | null> = signal(null);
  public isLoading: WritableSignal<boolean> = signal(false);
  public erro: WritableSignal<string | null> = signal(null);

  /**
   * Carrega o resumo completo do Admin utilizando signals.
   */
  async carregarResumoAdmin(): Promise<void> {
    this.isLoading.set(true);
    this.erro.set(null);

    try {
      const usuarioLogado = this.authService.getAuthState()?.user;

      await Promise.all([
        this.adminService.loadAllclients(),
        this.adminService.listaremployees(),
        this.comissaoService.calcularComissaoDoUsuario(),
      ]);

      const clients = this.adminService.todosclients();
      const employees = this.adminService.employees();
      const pagamentos: HistoricoPagamento[] =
        (await lastValueFrom(this.pagamentoService.obterTodosPagamentos())) ??
        [];

      const comissao = this.comissaoService.comissao();

      this.resumo.set({
        usuarioLogado: usuarioLogado
          ? {
              first_name: usuarioLogado.first_name,
              last_name: usuarioLogado.last_name,
              cpf: usuarioLogado.cpf,
              role: usuarioLogado.role,
              email: usuarioLogado.email,
            }
          : {
              first_name: '',
              last_name: '',
              cpf: '',
              role: 'client',
              email: '',
            },
        adminResumo: {
          totalclients: clients.length,
          totalemployees: employees.length,
          clientsAtivos: clients.filter(
            (client) => client.status === 'aprovado',
          ).length,
          employeesAtivos: employees.filter(
            (employee) => employee.is_active,
          ).length,
          novosclients: clients.slice(0, 5).map((client) => ({
            first_name: client.first_name,
            last_name: client.last_name,
            registration_date: client.registration_date,
          })),
          novosemployees: employees.slice(0, 5).map((employee) => ({
            first_name: employee.first_name,
            last_name: employee.last_name,
            registration_date: employee.registration_date,
          })),
          adesoes: comissao?.adesoes ?? [],
        },
        pagamentosResumo: {
          totalRealizados: pagamentos.filter(
            (pagamento) => pagamento.status === 'realizado',
          ).length,
          totalPendentes: pagamentos.filter(
            (pagamento) => pagamento.status === 'pendente',
          ).length,
          totalCancelados: pagamentos.filter(
            (pagamento) => pagamento.status === 'cancelado',
          ).length,
          historicoPagamentos: pagamentos.slice(0, 10),
        },
        adesoesResumo: {
          total: comissao?.adesoes.length ?? 0,
          aprovadas:
            comissao?.adesoes.filter((adesao) => adesao.status === 'aprovado')
              .length ?? 0,
          pendentes:
            comissao?.adesoes.filter((adesao) => adesao.status === 'pendente')
              .length ?? 0,
          rejeitadas:
            comissao?.adesoes.filter((adesao) => adesao.status === 'reprovado')
              .length ?? 0,
          detalhes: comissao?.adesoes ?? [],
        },
        employeeResumo: comissao
          ? {
              totalPropostas: comissao.adesoes.length,
              propostasPendentes: comissao.adesoes.filter(
                (adesao) => adesao.status === 'pendente',
              ).length,
              historicoPropostas: comissao.adesoes
                .slice(0, 5)
                .map((adesao) => ({
                  data: adesao.dataCriacao ?? '',
                  cliente: adesao.associado
                    ? `${adesao.associado.first_name} ${adesao.associado.last_name}`
                    : 'Não informado',
                  valor: adesao.valorAdesao,
                  status: (adesao.status.charAt(0).toUpperCase() +
                    adesao.status.slice(1)) as
                    | 'Aprovado'
                    | 'Pendente'
                    | 'Rejeitado',
                })),
            }
          : undefined,
        clientResumo: undefined,
      });
    } catch (error) {
      console.error('[ResumoService] Erro ao carregar resumo:', error);
      this.erro.set('Erro ao carregar dados do resumo.');
      this.resumo.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Reinicializa o resumo ao estado inicial.
   */
  resetarResumo(): void {
    this.resumo.set(null);
    this.erro.set(null);
    this.isLoading.set(false);
  }

  /**
   * Atualiza o resumo manualmente com os dados fornecidos.
   * @param dados Dados para atualizar o resumo.
   */
  atualizarResumo(dados: Resumo): void {
    this.resumo.set(dados);
  }

  /**
   * Atualiza somente os pagamentos do resumo.
   */
  async atualizarPagamentosResumo(): Promise<void> {
    this.isLoading.set(true);
    this.erro.set(null);

    try {
      const pagamentos: HistoricoPagamento[] =
        (await lastValueFrom(this.pagamentoService.obterTodosPagamentos())) ??
        [];

      const resumoAtual = this.resumo();

      if (resumoAtual) {
        this.resumo.update((resumo) => ({
          ...resumo!,
          pagamentosResumo: {
            totalRealizados: pagamentos.filter((p) => p.status === 'realizado')
              .length,
            totalPendentes: pagamentos.filter((p) => p.status === 'pendente')
              .length,
            totalCancelados: pagamentos.filter((p) => p.status === 'cancelado')
              .length,
            historicoPagamentos: pagamentos.slice(0, 10),
          },
        }));
      }
    } catch (error) {
      console.error('[ResumoService] Erro ao atualizar pagamentos:', error);
      this.erro.set('Erro ao atualizar pagamentos.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Atualiza o resumo das adesões.
   */
  async atualizarAdesoesResumo(): Promise<void> {
    this.isLoading.set(true);
    this.erro.set(null);

    try {
      await this.comissaoService.calcularComissaoDoUsuario();
      const comissao = this.comissaoService.comissao();

      const resumoAtual = this.resumo();

      if (resumoAtual && comissao) {
        this.resumo.update((resumo) => ({
          ...resumo!,
          adesoesResumo: {
            total: comissao.adesoes.length,
            aprovadas: comissao.adesoes.filter((a) => a.status === 'aprovado')
              .length,
            pendentes: comissao.adesoes.filter((a) => a.status === 'pendente')
              .length,
            rejeitadas: comissao.adesoes.filter((a) => a.status === 'reprovado')
              .length,
            detalhes: comissao.adesoes,
          },
        }));
      }
    } catch (error) {
      console.error('[ResumoService] Erro ao atualizar adesões:', error);
      this.erro.set('Erro ao atualizar adesões.');
    } finally {
      this.isLoading.set(false);
    }
  }
  async getResumoAdmin(): Promise<Resumo | null> {
    this.isLoading.set(true);
    this.erro.set(null);

    try {
      const usuarioLogado = this.authService.getAuthState()?.user;

      const [clients, employees, pagamentos, comissao] = await Promise.all([
        this.adminService
          .loadAllclients()
          .then(() => this.adminService.todosclients()),
        this.adminService
          .listaremployees()
          .then(() => this.adminService.employees()),
        lastValueFrom(this.pagamentoService.obterTodosPagamentos()),
        this.comissaoService
          .calcularComissaoDoUsuario()
          .then(() => this.comissaoService.comissao()),
      ]);

      const resumo: Resumo = {
        usuarioLogado: usuarioLogado
          ? {
              first_name: usuarioLogado.first_name,
              last_name: usuarioLogado.last_name,
              cpf: usuarioLogado.cpf,
              role: usuarioLogado.role,
              email: usuarioLogado.email,
            }
          : {
              first_name: '',
              last_name: '',
              cpf: '',
              role: 'client',
              email: '',
            },
        adminResumo: {
          totalclients: clients.length,
          totalemployees: employees.length,
          clientsAtivos: clients.filter(
            (client) => client.status === 'aprovado',
          ).length,
          employeesAtivos: employees.filter(
            (employee) => employee.is_active,
          ).length,
          novosclients: clients.slice(0, 5).map((client) => ({
            first_name: client.first_name,
            last_name: client.last_name,
            registration_date: client.registration_date,
          })),
          novosemployees: employees.slice(0, 5).map((employee) => ({
            first_name: employee.first_name,
            last_name: employee.last_name,
            registration_date: employee.registration_date,
          })),
          adesoes: comissao?.adesoes ?? [],
        },
        pagamentosResumo: {
          totalRealizados: pagamentos.filter(
            (pagamento) => pagamento.status === 'realizado',
          ).length,
          totalPendentes: pagamentos.filter(
            (pagamento) => pagamento.status === 'pendente',
          ).length,
          totalCancelados: pagamentos.filter(
            (pagamento) => pagamento.status === 'cancelado',
          ).length,
          historicoPagamentos: pagamentos.slice(0, 10),
        },
        adesoesResumo: {
          total: comissao?.adesoes.length ?? 0,
          aprovadas:
            comissao?.adesoes.filter((adesao) => adesao.status === 'aprovado')
              .length ?? 0,
          pendentes:
            comissao?.adesoes.filter((adesao) => adesao.status === 'pendente')
              .length ?? 0,
          rejeitadas:
            comissao?.adesoes.filter((adesao) => adesao.status === 'reprovado')
              .length ?? 0,
          detalhes: comissao?.adesoes ?? [],
        },
        employeeResumo: comissao
          ? {
              totalPropostas: comissao.adesoes.length,
              propostasPendentes: comissao.adesoes.filter(
                (adesao) => adesao.status === 'pendente',
              ).length,
              historicoPropostas: comissao.adesoes
                .slice(0, 5)
                .map((adesao) => ({
                  data: adesao.dataCriacao ?? '',
                  cliente: adesao.associado
                    ? `${adesao.associado.first_name} ${adesao.associado.last_name}`
                    : 'Não informado',
                  valor: adesao.valorAdesao,
                  status: (adesao.status.charAt(0).toUpperCase() +
                    adesao.status.slice(1)) as
                    | 'Aprovado'
                    | 'Pendente'
                    | 'Rejeitado',
                })),
            }
          : undefined,
        clientResumo: undefined,
      };

      this.resumo.set(resumo);

      return resumo;
    } catch (error) {
      console.error('[ResumoService] Erro ao obter resumo admin:', error);
      this.erro.set('Erro ao carregar dados do resumo.');
      this.resumo.set(null);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }
  /**
   * Retorna o valor atual do Signal `resumo`.
   * Totalmente baseado em Signals, sem uso de Observable.
   */
  getResumo(): Resumo | null {
    return this.resumo();
  }
}
