/**
 * @file address.model.ts
 * Define a estrutura de um endereço padronizado
 * para uso em Company, AuthenticatedUser, Cliente, etc.
 */
export interface Address {
  street: string; // Rua
  number: string; // Número
  complement?: string; // Complemento (opcional)
  neighborhood: string; // Bairro
  city: string; // Cidade
  state: string; // Estado
  postal_code: string; // CEP (ex.: 01001-000)
  country?: string; // País (opcional, default "Brasil")
}
