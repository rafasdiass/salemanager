/**
 * @file address.model.ts
 * Define a estrutura de um endereço padronizado
 * para uso em Company, AuthenticatedUser, etc.
 */
export interface Address {
  street: string;
  number: string;
  complement?: string; // Campo opcional
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string; // Ex.: CEP
  country?: string; // Caso deseje permitir preenchimento de país
}
