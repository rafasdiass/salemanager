import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class employeeGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('employeeGuard: Validando rota...', state.url);

    const authState = this.authService.getAuthState();

    if (authState.isAuthenticated && authState.user?.role === 'employee') {
      console.log('employeeGuard: Acesso permitido para employee.');
      return true;
    }

    console.warn(
      authState.isAuthenticated
        ? `employeeGuard: Role '${authState.user?.role}' não tem permissão.`
        : 'employeeGuard: Usuário não autenticado.'
    );

    // Redireciona para a tela de login com o parâmetro returnUrl
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });

    return false;
  }
}
