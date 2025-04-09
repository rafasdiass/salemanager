import {
  Injectable,
  WritableSignal,
  signal,
  effect,
  inject,
} from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { client } from '../models/client.model';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class employeeService {
  private readonly endpoint = 'employee';

  /** Signal para armazenar o usuário employee autenticado */
  public usuarioAutenticado: WritableSignal<AuthenticatedUser | null> =
    signal(null);

  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  constructor() {
    this.initUsuarioAutenticado();
  }

  /**
   * Inicializa o estado do usuário employee autenticado usando Signals.
   */
  private initUsuarioAutenticado(): void {
    effect(() => {
      const authState = this.authService.getAuthState();
      const usuario =
        authState?.user && authState.user.role === 'employee'
          ? authState.user
          : null;

      this.usuarioAutenticado.set(usuario);

      if (!usuario) {
        console.warn(
          '[employeeService] Nenhum usuário employee autenticado.',
        );
      }
    });
  }

  /**
   * Lista todos os clients cadastrados.
   * @returns Observable com lista de clients.
   */
  listarclients(): Observable<client[]> {
    return this.apiService.get<client[]>(`${this.endpoint}/clients`).pipe(
      catchError((error) => {
        console.error('[employeeService] Erro ao listar clients:', error);
        return throwError(() => new Error('Erro ao carregar clients.'));
      }),
    );
  }

  /**
   * Busca clients com base em um termo de pesquisa.
   * @param query Termo de busca (ex.: nome ou CPF).
   * @returns Observable com a lista de clients encontrados.
   */
  buscarclient(query: string): Observable<client[]> {
    if (!query) {
      console.warn('[employeeService] Termo de busca vazio.');
      return throwError(
        () => new Error('O termo de busca não pode ser vazio.'),
      );
    }

    return this.apiService
      .get<client[]>(`${this.endpoint}/clients/busca?query=${query}`)
      .pipe(
        catchError((error) => {
          console.error('[employeeService] Erro ao buscar client:', error);
          return throwError(() => new Error('Erro ao buscar client.'));
        }),
      );
  }

  /**
   * Cadastra um novo client e associa ao usuário employee autenticado.
   * @param client Dados do client a ser cadastrado.
   * @returns Observable com o client criado.
   */
  cadastrarclient(client: Partial<client>): Observable<client> {
    const usuario = this.usuarioAutenticado();

    if (!usuario) {
      console.error(
        '[employeeService] Tentativa de cadastro sem usuário employee autenticado.',
      );
      return throwError(() => new Error('Usuário employee não autenticado.'));
    }

    const payload = {
      ...client,
      employeeId: usuario.id,
      is_active: false,
      status: 'pendente',
    };

    return this.apiService
      .post<client>(`${this.endpoint}/clients`, payload)
      .pipe(
        catchError((error) => {
          console.error(
            '[employeeService] Erro ao cadastrar client:',
            error,
          );
          return throwError(() => new Error('Erro ao cadastrar client.'));
        }),
      );
  }

  /**
   * Edita os dados de um client.
   * @param id ID do client.
   * @param client Dados atualizados do client.
   * @returns Observable com o client atualizado.
   */
  editarclient(
    id: string,
    client: Partial<client>,
  ): Observable<client> {
    if (!id) {
      console.warn('[employeeService] Tentativa de edição sem ID válido.');
      return throwError(() => new Error('ID do client inválido.'));
    }

    return this.apiService
      .put<client>(`${this.endpoint}/clients/${id}`, client)
      .pipe(
        catchError((error) => {
          console.error('[employeeService] Erro ao editar client:', error);
          return throwError(() => new Error('Erro ao editar client.'));
        }),
      );
  }

  /**
   * Deleta um client pelo ID.
   * @param id ID do client a ser deletado.
   * @returns Observable indicando sucesso ou falha.
   */
  deletarclient(id: string): Observable<void> {
    if (!id) {
      console.warn('[employeeService] Tentativa de exclusão sem ID válido.');
      return throwError(() => new Error('ID do client inválido.'));
    }

    return this.apiService
      .delete<void>(`${this.endpoint}/clients/${id}`)
      .pipe(
        catchError((error) => {
          console.error('[employeeService] Erro ao deletar client:', error);
          return throwError(() => new Error('Erro ao deletar client.'));
        }),
      );
  }
}
