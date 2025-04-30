import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private activePage: string = ''; // Página ativa atual.
  private readonly activePageKey: string = 'activePage'; // Chave para persistência no LocalStorage.

  constructor(
    private router: Router,
    private localStorage: LocalStorageService
  ) {}

  /**
   * Navega para uma rota específica e define a página ativa.
   *
   * @param route - Rota de destino.
   * @param extras - Parâmetros de navegação opcionais, como queryParams, fragment etc.
   * @returns Promise<boolean> - Indica se a navegação foi concluída com sucesso.
   */
  navigateTo(route: string, extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate([route], extras).then((success) => {
      if (success) {
        this.setActivePage(route); // Define a página ativa após navegação bem-sucedida.
      }
      return success;
    });
  }

  /**
   * Define e persiste a página ativa com base na rota fornecida.
   *
   * @param route - Rota para definir como ativa.
   */
  private setActivePage(route: string): void {
    this.activePage = route;
    this.localStorage.setItem(this.activePageKey, this.activePage); // Persiste a página ativa no LocalStorage.
  }

  /**
   * Obtém a página ativa atual. Caso não exista, tenta carregá-la do LocalStorage.
   *
   * @returns string - Nome da página ativa.
   */
  getActivePage(): string {
    if (!this.activePage) {
      this.activePage =
        this.localStorage.getItem<string>(this.activePageKey) || '';
    }
    return this.activePage;
  }

  /**
   * Verifica se a rota fornecida corresponde à página ativa armazenada.
   *
   * @param route - Rota para comparar.
   * @returns boolean - Verdadeiro se a rota corresponde à página ativa.
   */
  isActivePage(route: string): boolean {
    return this.getActivePage() === route;
  }

  /**
   * Redireciona para o dashboard apropriado com base na role do usuário.
   *
   * @param role - Papel do usuário ('admin', 'employee', 'client').
   * @returns Promise<boolean> - Resultado da navegação.
   */
  navigateToDashboard(role: string): Promise<boolean> {
    const routes: { [key: string]: string } = {
      admin: '/dashboard-admin',
      employee: '/dashboard-employee',
      client: '/dashboard-usuario',
    };

    const targetRoute: string = routes[role] || '/login'; // Redireciona para login se a role for inválida.
    return this.navigateTo(targetRoute);
  }

  /**
   * Reseta a página ativa, útil em casos de logout ou mudanças de contexto.
   */
  resetActivePage(): void {
    this.activePage = '';
    this.localStorage.removeItem(this.activePageKey); // Remove a página ativa do LocalStorage.
  }
}
