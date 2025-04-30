import { AuthenticatedUser } from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';

/**
 * Obtém o ID da empresa do usuário autenticado.
 *
 * @param user Usuário autenticado
 * @returns ID da empresa vinculada
 */
export function getPrimaryCompanyId(user: AuthenticatedUser): string {
  const role: UserRole = user.role;

  if (role === UserRole.ADMIN || role === UserRole.employee) {
    if (!user.companyId) {
      throw new Error('Usuário não está vinculado a nenhuma empresa.');
    }
    return user.companyId;
  }

  throw new Error(`Tipo de usuário inválido: ${user.role}`);
}
