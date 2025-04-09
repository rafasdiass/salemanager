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
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('AdminGuard: Validando rota...', state.url);

    const authState = this.authService.getAuthState();

    if (authState.isAuthenticated && authState.user?.role === 'ADMIN') {
      console.log('AdminGuard: Acesso permitido para admin.');
      return true;
    }

    console.warn(
      authState.isAuthenticated
        ? `AdminGuard: Role '${authState.user?.role}' não tem permissão.`
        : 'AdminGuard: Usuário não autenticado.'
    );

    // Redireciona para a tela de login com o parâmetro returnUrl
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });

    return false;
  }
}
