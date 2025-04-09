import { AuthenticatedUser } from './auth.model';
import { client } from './client.model';
import { employee } from './employee.model';
import { HistoricoPagamento } from './pagamento.model';
import { PropostaAdesao } from './proposta-adesao.model';

export interface Resumo {
  usuarioLogado: Pick<
    AuthenticatedUser,
    'first_name' | 'last_name' | 'cpf' | 'role' | 'email'
  >;

  adminResumo?: {
    totalclients: number;
    totalemployees: number;
    clientsAtivos: number;
    employeesAtivos: number;
    novosclients: Array<
      Pick<client, 'first_name' | 'last_name' | 'registration_date'>
    >;
    novosemployees: Array<
      Pick<employee, 'first_name' | 'last_name' | 'registration_date'>
    >;
    adesoes: Array<Pick<PropostaAdesao, 'titulo' | 'status' | 'valorAdesao'>>; // Adicionando o uso da interface PropostaAdesao
  };

  employeeResumo?: {
    totalPropostas: number;
    propostasPendentes: number;
    historicoPropostas: Array<{
      data: string;
      cliente: string;
      valor: number;
      status: 'Aprovado' | 'Pendente' | 'Rejeitado';
    }>;
  };

  clientResumo?: {
    totalAdesoes: number;
    totalPagoSemJuros: number;
    totalPagoComJuros: number;
    saldoDevedorSemJuros: number;
    saldoDevedorComJuros: number;
    historicoPagamentos: HistoricoPagamento[];
    propostas: Array<PropostaAdesao>; // Adicionando o uso da interface PropostaAdesao
  };

  adesoesResumo?: {
    total: number;
    aprovadas: number;
    pendentes: number;
    rejeitadas: number;
    detalhes: Array<Pick<PropostaAdesao, 'titulo' | 'status' | 'valorAdesao'>>; // Adicionando uso da interface PropostaAdesao
  };

  pagamentosResumo?: {
    totalRealizados: number;
    totalPendentes: number;
    totalCancelados: number;
    historicoPagamentos: HistoricoPagamento[];
  };
}
