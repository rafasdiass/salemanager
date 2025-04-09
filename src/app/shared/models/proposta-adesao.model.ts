import { client } from './client.model';

/**
 * Representa os dados de uma proposta de adesão.
 */
export interface PropostaAdesao {
  id?: string; // ID único da proposta ou ficha de adesão
  titulo: string; // Título da proposta ou identificação da adesão
  descricao?: string; // Descrição detalhada da proposta ou adesão
  status: 'aprovado' | 'pendente' | 'reprovado'; // Status da proposta ou adesão
  dataCriacao?: string; // Data de criação
  dataAtualizacao?: string; // Data da última atualização

  // Valores financeiros
  valorAdesao: number; // Valor total da adesão
  valorSemJuros: number; // Valor total sem juros
  valorComJuros: number; // Valor total com juros
  valorPagoSemJuros: number; // Valor pago sem juros
  valorPagoComJuros: number; // Valor pago com juros
  valorRestanteSemJuros: number; // Valor restante sem juros
  valorRestanteComJuros: number; // Valor restante com juros

  // Parcelas fixas
  parcelasFixas: {
    adesao: number; // Valor fixo da adesão
    terreno: number; // Valor fixo do terreno
  };

  // Parcelas variáveis (obra)
  parcelasObra: {
    totalParcelas: number; // Total de parcelas de obra
    parcelasPagas: number; // Parcelas de obra já pagas
    parcelasRestantes: number; // Parcelas de obra restantes
    valorParcelaSemJuros: number; // Valor de cada parcela (sem juros e sem INCC)
    valorParcelaCorrigida: number; // Valor de cada parcela corrigida pelo INCC
    detalhes: {
      vencimento: string; // Data de vencimento
      status: 'paga' | 'pendente' | 'atrasada'; // Status da parcela
      valorPago?: number; // Valor pago na parcela
      inccAplicado?: number; // Valor de correção aplicado pelo INCC
    }[];
  };

  associado: client; // Dados do client associado
  programaHabitacional: string; // Nome do programa habitacional
  fase: string; // Fase do programa
  tipoUnidade: string; // Tipo da unidade
  areaUnidade?: {
    privativa: number; // Área privativa
    comumInterna: number; // Área comum interna
    comumExterna: number; // Área comum externa
    total: number; // Área total
  };
}
