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
export class UsuarioGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('UsuarioGuard: Validando rota...', state.url);

    const authState = this.authService.getAuthState();

    if (authState.isAuthenticated && authState.user?.role === 'client') {
      console.log('UsuarioGuard: Acesso permitido para client.');
      return true;
    }

    console.warn(
      authState.isAuthenticated
        ? `UsuarioGuard: Role '${authState.user?.role}' não tem permissão.`
        : 'UsuarioGuard: Usuário não autenticado.'
    );

    // Redireciona para a tela de login com o parâmetro returnUrl
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });

    return false;
  }
}
