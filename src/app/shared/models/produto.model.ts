export interface Produto {
  id?: string;
  nome: string;
  preco: number;
  categoria?: string;
  estoque: number;
  imagemUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
