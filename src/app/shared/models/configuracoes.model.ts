export interface Configuracoes {
  usarIncc: boolean; // Indica se a correção pelo INCC deve ser aplicada
  indiceIncc: number; // Percentual do índice INCC atual (editável pelo usuário)
  dataBaseIncc: Date; // Data base para o índice INCC

  parcelasObra: {
    valorBase: number; // Valor base das parcelas de obra (antes de qualquer correção)
    totalParcelas: number; // Total de parcelas de obra
    parcelasPagas: number; // Total de parcelas de obra pagas
    parcelasRestantes: number; // Total de parcelas de obra restantes
    valorCorrigido?: number; // Valor corrigido das parcelas de obra (calculado automaticamente)
  };

  retirarJuros: boolean; // Indica se os juros devem ser retirados de todos os segurados
}
