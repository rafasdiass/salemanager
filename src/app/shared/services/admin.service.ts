import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { employee } from '../models/employee.model';
import { client } from '../models/client.model';
import { Configuracoes } from '../models/configuracoes.model';
import { BeneficioAdmin } from '../models/beneficio.model';
import { BeneficioService } from './beneficio.service';
import { HttpErrorResponse } from '@angular/common/http';

interface ApiError {
  statusCode: number;
  message: string;
  error?: unknown;
}

export interface clientstatusUpdate {
  status: 'aprovado' | 'pendente' | 'rejeitado' | 'cancelado';
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly endpoint: string = 'admin';

  configuracoes = signal<Configuracoes | null>(null);
  employees = signal<employee[]>([]);
  employeeSelecionado = signal<employee | null>(null);
  clientsPendentes = signal<client[]>([]);
  todosclients = signal<client[]>([]);
  beneficios = signal<BeneficioAdmin[]>([]);

  constructor(
    private readonly apiService: ApiService,
    private readonly beneficioService: BeneficioService,
  ) {}

  // -------------------------------------------------------------------------
  // Configurações do Sistema
  // -------------------------------------------------------------------------
  async carregarConfiguracoes(): Promise<void> {
    try {
      const config = await this.apiService
        .get<Configuracoes>(`${this.endpoint}/config-system`)
        .toPromise();
      this.configuracoes.set(config ?? null);
    } catch (error) {
      this.handleError('Erro ao carregar configurações', error);
    }
  }

  async atualizarConfiguracoes(config: Configuracoes): Promise<void> {
    try {
      const configAtualizado = await this.apiService
        .put<Configuracoes>(`${this.endpoint}/config-system`, config)
        .toPromise();
      this.configuracoes.set(configAtualizado ?? null);
    } catch (error) {
      this.handleError('Erro ao atualizar configurações', error);
    }
  }

  // -------------------------------------------------------------------------
  // Gestão de clients
  // -------------------------------------------------------------------------
  async carregarclientsPendentes(): Promise<void> {
    try {
      const clients = await this.apiService
        .get<client[]>(`${this.endpoint}/clients/pendentes`)
        .toPromise();
      this.clientsPendentes.set(clients ?? []);
    } catch (error) {
      this.handleError('Erro ao carregar clients pendentes', error);
    }
  }

  async loadAllclients(nome?: string): Promise<void> {
    try {
      const queryString = nome ? `?nome=${encodeURIComponent(nome)}` : '';
      const clients = await this.apiService
        .get<client[]>(`${this.endpoint}clients/all${queryString}`)
        .toPromise();

      this.todosclients.set(clients ?? []);
    } catch (error) {
      this.handleError('Erro ao carregar todos clients', error);
      this.todosclients.set([]);
    }
  }

  async aprovarclient(id: string): Promise<void> {
    try {
      await this.apiService
        .post<void>(`${this.endpoint}/clients/${id}/aprovar`, {})
        .toPromise();
      this.clientsPendentes.update((list) =>
        list.filter((c) => c.id !== id),
      );
    } catch (error) {
      this.handleError(`Erro ao aprovar client ${id}`, error);
    }
  }

  async rejeitarclient(id: string): Promise<void> {
    try {
      await this.apiService
        .post<void>(`${this.endpoint}/clients/${id}/rejeitar`, {})
        .toPromise();
      this.clientsPendentes.update((list) =>
        list.filter((c) => c.id !== id),
      );
    } catch (error) {
      this.handleError(`Erro ao rejeitar client ${id}`, error);
    }
  }

  async alterarStatusclient(
    id: string,
    statusUpdate: clientstatusUpdate,
  ): Promise<void> {
    const statusFinal =
      statusUpdate.status === 'cancelado' ? 'rejeitado' : statusUpdate.status;
    try {
      await this.apiService
        .put<void>(`${this.endpoint}/clients/${id}/status`, {
          status: statusFinal,
        })
        .toPromise();
      this.clientsPendentes.update((list) =>
        list.map((c) => (c.id === id ? { ...c, status: statusFinal } : c)),
      );
    } catch (error) {
      this.handleError(`Erro ao alterar status do client ${id}`, error);
    }
  }

  // -------------------------------------------------------------------------
  // Gestão de employees
  // -------------------------------------------------------------------------
  async listaremployees(): Promise<void> {
    try {
      const employees = await this.apiService
        .get<employee[]>(`${this.endpoint}/employees`)
        .toPromise();
      this.employees.set(employees ?? []);
    } catch (error) {
      this.handleError('Erro ao listar employees', error);
    }
  }

  async obteremployeePorId(id: string): Promise<void> {
    try {
      const employee = await this.apiService
        .get<employee>(`${this.endpoint}/employees/${id}`)
        .toPromise();
      if (employee) this.employeeSelecionado.set(employee);
    } catch (error) {
      this.handleError(`Erro ao obter employee ${id}`, error);
    }
  }

  async cadastraremployee(employee: Partial<employee>): Promise<void> {
    try {
      const novoemployee = await this.apiService
        .post<employee>(`${this.endpoint}/employees`, employee)
        .toPromise();
      if (novoemployee) {
        this.employees.update((prev) => [...prev, novoemployee]);
      }
    } catch (error) {
      this.handleError('Erro ao cadastrar employee', error);
    }
  }

  async editaremployee(
    id: string,
    employee: Partial<employee>,
  ): Promise<void> {
    try {
      const atualizado = await this.apiService
        .put<employee>(`${this.endpoint}/employees/${id}`, employee)
        .toPromise();
      if (atualizado) {
        this.employees.update((list) =>
          list.map((c) => (c.id === id ? atualizado : c)),
        );
      }
    } catch (error) {
      this.handleError(`Erro ao editar employee ${id}`, error);
    }
  }

  async deletaremployee(id: string): Promise<void> {
    try {
      await this.apiService
        .delete<void>(`${this.endpoint}/employees/${id}`)
        .toPromise();
      this.employees.update((list) => list.filter((c) => c.id !== id));
    } catch (error) {
      this.handleError(`Erro ao deletar employee ${id}`, error);
    }
  }

  // -------------------------------------------------------------------------
  // Gestão de Benefícios
  // -------------------------------------------------------------------------
  async carregarBeneficios(): Promise<void> {
    try {
      const beneficios = await this.apiService
        .get<BeneficioAdmin[]>(`${this.endpoint}/beneficios`)
        .toPromise();
      this.beneficios.set(beneficios ?? []);
    } catch (error) {
      this.handleError('Erro ao carregar benefícios', error);
    }
  }

  // -------------------------------------------------------------------------
  // Tratamento detalhado de erros
  // -------------------------------------------------------------------------
  private handleError(contextMessage: string, error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      const apiError: ApiError = {
        statusCode: error.status,
        message: error.message,
        error: error.error ?? 'Erro não especificado pela API',
      };
      console.error(`[AdminService] ❌ ${contextMessage}:`, apiError);
    } else {
      console.error(`[AdminService] ❌ ${contextMessage}:`, error);
    }
  }
}
