import { AuthenticatedUser } from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';

/**
 * Retorna a empresa ativa de acordo com o tipo de usuário:
 * - Admin e Funcionário: usa o primeiro item de companyIds.
 * - Cliente: usa o último cupom utilizado (couponUsed).
 *
 * @param user Usuário autenticado
 * @returns ID da empresa ativa
 */
export function getPrimaryCompanyId(user: AuthenticatedUser): string {
  const role: UserRole = user.role;

  if (role === 'client') {
    if (!user.couponUsed) {
      throw new Error('Cliente não possui cupom vinculado (empresa ativa).');
    }
    return user.couponUsed;
  }

  if (role === 'ADMIN' || role === 'employee') {
    if (!user.companyIds || user.companyIds.length === 0) {
      throw new Error('Usuário não está vinculado a nenhuma empresa.');
    }
    return user.companyIds[0];
  }

  throw new Error(`Tipo de usuário inválido: ${user.role}`);
}
