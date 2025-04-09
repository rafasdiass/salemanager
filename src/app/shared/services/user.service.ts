import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthenticatedUser } from '../models/auth.model';
import { LocalStorageService } from './local-storage.service';

/**
 * Serviço responsável por gerenciar os dados do usuário autenticado
 * e o token de autenticação, armazenando-os (e recuperando-os) do localStorage.
 * Também expõe Observables para que outras partes da aplicação possam
 * reagir às mudanças desses dados em tempo real.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  /**
   * BehaviorSubject que mantém o estado atual dos dados do usuário.
   * Qualquer componente que fizer subscribe em userData$ receberá atualizações
   * sempre que userDataSubject.next(...) for chamado.
   */
  private userDataSubject = new BehaviorSubject<AuthenticatedUser | null>(null);

  /**
   * BehaviorSubject que mantém o estado atual do token de autenticação.
   * Qualquer componente que fizer subscribe em token$ receberá atualizações
   * sempre que tokenSubject.next(...) for chamado.
   */
  private tokenSubject = new BehaviorSubject<string | null>(null);

  /**
   * Observable (somente leitura) para que outras partes do app
   * possam se inscrever e receber o valor atual de userData e suas mudanças.
   */
  public userData$: Observable<AuthenticatedUser | null> =
    this.userDataSubject.asObservable();

  /**
   * Observable (somente leitura) para que outras partes do app
   * possam se inscrever e receber o valor atual do token e suas mudanças.
   */
  public token$: Observable<string | null> = this.tokenSubject.asObservable();

  // Chaves usadas para armazenar dados e token no localStorage
  private readonly USER_DATA_KEY = 'userData';
  private readonly TOKEN_KEY = 'authToken';

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private localStorageService: LocalStorageService
  ) {
    // Ao instanciar o serviço, já tentamos carregar as informações
    // que possam existir no localStorage.
    this.loadUserDataFromStorage();
    this.loadTokenFromStorage();
  }

  /**
   * Verifica se a aplicação está sendo executada no navegador.
   * Se estiver rodando em SSR (Server-Side Rendering), não há localStorage.
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Carrega os dados do usuário autenticado do localStorage,
   * se existir, e emite valor no userDataSubject.
   * Assim, quem estiver inscrito em userData$ receberá esse valor.
   */
  private loadUserDataFromStorage(): void {
    if (!this.isBrowser()) return;

    const userData = this.localStorageService.getItem<AuthenticatedUser>(
      this.USER_DATA_KEY
    );

    if (userData) {
      this.userDataSubject.next(userData);
    } else {
      console.warn('Nenhum dado de usuário encontrado no armazenamento local.');
      this.userDataSubject.next(null);
    }
  }

  /**
   * Carrega o token de autenticação do localStorage,
   * se existir, e emite valor no tokenSubject.
   * Assim, quem estiver inscrito em token$ receberá esse valor.
   */
  private loadTokenFromStorage(): void {
    if (!this.isBrowser()) return;

    const token = this.localStorageService.getItem<string>(this.TOKEN_KEY);

    if (token) {
      this.tokenSubject.next(token);
    } else {
      console.warn(
        'Nenhum token de autenticação encontrado no armazenamento local.'
      );
      this.tokenSubject.next(null);
    }
  }

  /**
   * Armazena os dados do usuário autenticado no localStorage e
   * atualiza o BehaviorSubject correspondente. Isso notifica
   * todos os assinantes de userData$.
   * @param userData Dados do usuário autenticado.
   */
  setUserData(userData: AuthenticatedUser): void {
    if (!this.isBrowser()) return;

    // Salva no localStorage
    this.localStorageService.setItem(this.USER_DATA_KEY, userData);
    // Atualiza quem estiver inscrito em userData$
    this.userDataSubject.next(userData);
  }

  /**
   * Armazena o token de autenticação no localStorage e
   * atualiza o BehaviorSubject correspondente. Isso notifica
   * todos os assinantes de token$.
   * @param token Token de autenticação (JWT, por exemplo).
   */
  setToken(token: string): void {
    if (!this.isBrowser()) return;

    this.localStorageService.setItem(this.TOKEN_KEY, token);
    this.tokenSubject.next(token);
  }

  /**
   * Retorna os dados do usuário que estão no BehaviorSubject (em memória).
   * @returns Dados do usuário autenticado, ou null se não houver.
   */
  getUserData(): AuthenticatedUser | null {
    return this.userDataSubject.value;
  }

  /**
   * Retorna o token de autenticação armazenado no BehaviorSubject (em memória).
   * @returns Token de autenticação, ou null se não houver.
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Retorna a role do usuário autenticado, se houver um usuário.
   * @returns A role do usuário (e.g. 'ADMIN', 'employee', 'client') ou null.
   */
  getUserRole(): string | null {
    const user = this.userDataSubject.value;
    return user ? user.role : null;
  }

  /**
   * Retorna o CPF do usuário autenticado, se houver um usuário.
   * @returns O CPF do usuário ou null.
   */
  getUserCpf(): string | null {
    const user = this.userDataSubject.value;
    return user ? user.cpf : null;
  }

  /**
   * Limpa os dados do usuário e o token tanto do BehaviorSubject quanto do localStorage.
   * Normalmente chamado pelo AuthService no logout.
   */
  clearUserData(): void {
    if (!this.isBrowser()) return;

    this.localStorageService.removeItem(this.USER_DATA_KEY);
    this.localStorageService.removeItem(this.TOKEN_KEY);

    // Emite null, para que qualquer componente inscrito seja notificado
    this.userDataSubject.next(null);
    this.tokenSubject.next(null);
  }
}
