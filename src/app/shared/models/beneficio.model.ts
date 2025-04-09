export interface Beneficio {
  id: number;
  titulo: string; // Nome do benefício
  descricao: string; // Descrição do benefício
  tipo: string; // Tipo de benefício (financeiro, saúde, educação, etc.)
  validade?: Date; // Data de validade (opcional)
  status: 'ativo' | 'inativo'; // Status do benefício
}

export interface BeneficioAdmin extends Beneficio {
  associadoA?: string[]; // Lista de IDs de clients associados
  criadoEm: Date; // Data de criação do benefício
  atualizadoEm?: Date; // Data de última atualização (opcional)
}

export interface Beneficioclient extends Beneficio {
  utilizadoEm?: Date; // Data em que o benefício foi utilizado (se aplicável)
  expirado: boolean; // Indica se o benefício já expirou
}
