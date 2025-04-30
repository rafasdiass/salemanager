// src/app/shared/models/employee.model.ts

import { AuthenticatedUser } from "./auth.model";
import { UserRole } from './user-role.enum';

export interface EmployeeUser extends AuthenticatedUser {
  role: UserRole.employee;
  companyId: string; // empresa onde atua (única, se for o caso)
}
