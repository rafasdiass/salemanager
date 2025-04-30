// src/app/shared/models/admin.model.ts

import { AuthenticatedUser } from "./auth.model";
import { UserRole } from './user-role.enum';

export interface AdminUser extends AuthenticatedUser {
  role: UserRole.ADMIN;
  companyId: string; // empresa que ele administra
}
