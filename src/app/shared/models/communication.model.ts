export interface clientCommunication {
  /** Identificador único do comunicado */
  id: string;
  /** Título do comunicado */
  titulo: string;
  /** Mensagem ou conteúdo do comunicado */
  mensagem: string;
  /** Data em que o comunicado foi criado ou enviado */
  data: Date;
}
