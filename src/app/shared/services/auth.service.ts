// src/app/shared/services/auth.service.ts

import { Injectable, computed, signal, WritableSignal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import {
  AuthState,
  LoginRequest,
  LoginResponse,
  AuthenticatedUser,
} from '../models/auth.model';
import { UserRole } from '../models/user-role.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Estado de autenticação usando Signals */
  private authState: WritableSignal<AuthState> = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  readonly currentUser = computed(() => this.authState().user);
  readonly isLoggedIn = computed(() => this.authState().isAuthenticated);

  /** Computed do companyId principal baseado no usuário logado */
  readonly primaryCompanyId = computed(() => {
    const user = this.authState().user;
    if (!user) throw new Error('Usuário não autenticado.');

    if (user.role === UserRole.client) {
      if (!user.couponUsed) {
        throw new Error('Cliente não possui cupom vinculado.');
      }
      return user.couponUsed;
    }

    if (user.role === UserRole.ADMIN || user.role === UserRole.employee) {
      if (!user.companyIds || user.companyIds.length === 0) {
        throw new Error('Usuário não possui empresas vinculadas.');
      }
      return user.companyIds[0];
    }

    throw new Error(`Tipo de usuário inválido: ${user.role}`);
  });

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private router: Router
  ) {}

  getAuthState(): AuthState {
    return this.authState();
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  autoLogin(): void {
    const storedUser: AuthenticatedUser | null = this.userService.getUserData();
    const storedToken: string | null = this.userService.getToken();

    if (storedToken && storedUser) {
      console.log('AutoLogin: Usuário e token encontrados.');
      this.authState.set({
        isAuthenticated: true,
        user: storedUser,
        token: storedToken,
      });
    } else {
      console.log('AutoLogin: Nenhum usuário/token encontrado.');
      this.authState.set({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login', credentials).pipe(
      tap((response: LoginResponse) => {
        if (response.access_token && response.user) {
          console.log('Login bem-sucedido:', response);

          this.userService.setToken(response.access_token);
          this.userService.setUserData(response.user);

          this.authState.set({
            isAuthenticated: true,
            user: response.user,
            token: response.access_token,
          });

          if (!response.user.password || response.user.password.trim() === '') {
            console.log('Primeiro login detectado. Redirecionando...');
            this.router.navigate(['/definir-senha']);
          }
        } else {
          throw new Error('Erro: Resposta inválida do servidor.');
        }
      }),
      catchError((error: unknown) => this.handleError(error))
    );
  }

  definirSenhaPrimeiroAcesso(
    cpf: string,
    newPassword: string
  ): Observable<void> {
    const updateData = { cpf, password: newPassword };

    return this.apiService.put<void>('users/first-access', updateData).pipe(
      tap(() => {
        console.log('Senha definida com sucesso.');
        this.router.navigate(['/login']);
      }),
      catchError((error: unknown) => this.handleError(error))
    );
  }

  logout(): void {
    this.userService.clearUserData();
    this.authState.set({
      isAuthenticated: false,
      user: null,
      token: null,
    });

    console.log('Logout realizado com sucesso.');
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<string> {
    return this.apiService
      .post<{ access_token: string }>('refresh-token', {})
      .pipe(
        map((response: { access_token: string }) => {
          if (response.access_token) {
            console.log('Token renovado:', response.access_token);

            this.userService.setToken(response.access_token);
            this.authState.update((state) => ({
              ...state,
              token: response.access_token,
            }));

            return response.access_token;
          } else {
            throw new Error('Erro ao renovar o token.');
          }
        }),
        catchError((error: unknown) => {
          console.error('Erro ao renovar o token:', error);
          this.logout();
          return throwError(() => new Error('Erro ao renovar o token.'));
        })
      );
  }

  private handleError(error: unknown): Observable<never> {
    console.error('Erro no AuthService:', error);

    const errorMessage = this.getErrorMessage(error);
    return throwError(() => new Error(errorMessage));
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const status = (error as { status: number }).status;
      switch (status) {
        case 400:
          return 'Requisição inválida.';
        case 401:
          return 'Credenciais inválidas.';
        default:
          return 'Erro desconhecido. Tente novamente mais tarde.';
      }
    }
    return 'Erro inesperado. Tente novamente mais tarde.';
  }
}
