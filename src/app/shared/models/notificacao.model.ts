/**
 * Interface base para notificações, contendo os campos comuns utilizados tanto
 * na criação/gerenciamento pelo administrador quanto na exibição para os clients e employees.
 */
export interface NotificacaoBase {
  /** Identificador único da notificação */
  id: string;
  /** Título da notificação */
  titulo: string;
  /** Mensagem ou conteúdo da notificação */
  mensagem: string;
  /** Status da notificação (Pendente, Enviada ou Lida) */
  status: StatusNotificacao;
  /** Data e hora de criação da notificação */
  criadoEm: Date;
  /** Data e hora agendada para envio (opcional, apenas quando FormaEnvio for AGENDADO) */
  agendadoPara?: Date;
  /** URL para o arquivo anexado (se houver) */
  arquivoUrl?: string;
  /** Forma de envio: Imediato ou Agendado */
  formaEnvio: FormaEnvio;
  /** Tipo de notificação: Informativo, Importante ou Alerta */
  tipoNotificacao: TipoNotificacao;
  /** Data e hora da última atualização (caso a notificação seja editada) */
  atualizadoEm?: Date;
}

/**
 * Interface para notificações utilizadas pelo administrador.
 * Inclui os campos necessários para definir os destinatários.
 */
export interface AdminNotificacao extends NotificacaoBase {
  /**
   * Define o tipo de destinatário.
   * Pode ser TODOS_clients, clients_ESPECIFICOS, INDIVIDUAL ou employee_ESPECIFICO.
   */
  destinatario: TipoDestinatario;
  /**
   * Lista de IDs dos destinatários específicos.
   * Utilizado quando o tipo selecionado for clients_ESPECIFICOS ou INDIVIDUAL.
   */
  destinatariosEspecificos?: string[];
  /**
   * Identificador do administrador que criou a notificação.
   */
  criadoPorId: string;
}

/**
 * Interface para notificações direcionadas aos clients.
 * Como o client não escolhe o destino, os campos de definição do destinatário são omitidos.
 */
export interface clientNotificacao
  extends Omit<NotificacaoBase, 'destinatario' | 'destinatariosEspecificos'> {
  /** Identificador do client que recebeu a notificação */
  clientId: string;
  /** Indica se a notificação já foi lida pelo client */
  lida?: boolean;
  /** Data e hora em que o client leu a notificação */
  dataLeitura?: Date;
}

/**
 * Interface para notificações direcionadas ao perfil employee.
 * Nesta interface, o campo 'employeeId' identifica a quem a notificação foi enviada.
 */
export interface employeeNotificacao
  extends Omit<NotificacaoBase, 'destinatario' | 'destinatariosEspecificos'> {
  /** Identificador do usuário employee que recebeu a notificação */
  employeeId: string;
  /** Indica se a notificação já foi visualizada pelo usuário employee */
  visualizada?: boolean;
  /** Data e hora em que o usuário employee visualizou a notificação */
  dataVisualizacao?: Date;
}

/**
 * Enum que define os possíveis tipos de destinatários para notificações enviadas pelo admin.
 */
export enum TipoDestinatario {
  TODOS_clients = 'TODOS_clients',
  clients_ESPECIFICOS = 'clients_ESPECIFICOS',
  INDIVIDUAL = 'INDIVIDUAL',
  employee_ESPECIFICO = 'employee_ESPECIFICO',
}

/**
 * Enum que define os possíveis status de uma notificação.
 * Correspondente ao backend (NestJS + Prisma).
 */
export enum StatusNotificacao {
  PENDENTE = 'PENDENTE',
  ENVIADA = 'ENVIADA',
  LIDA = 'LIDA',
}

/**
 * Enum que define as formas de envio disponíveis para uma notificação.
 * Agora alinhado corretamente ao backend.
 */
export enum FormaEnvio {
  IMEDIATO = 'IMEDIATO',
  AGENDADO = 'AGENDADO',
}

/**
 * Enum que define os tipos de notificação conforme sua relevância ou prioridade.
 */
export enum TipoNotificacao {
  INFORMATIVO = 'INFORMATIVO',
  IMPORTANTE = 'IMPORTANTE',
  ALERTA = 'ALERTA',
}
