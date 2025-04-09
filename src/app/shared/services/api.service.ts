import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError } from 'rxjs';

/**
 * Serviço genérico para comunicação com APIs.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl: string = 'https://back-sistema-sj7t.onrender.com';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  /**
   * Realiza uma requisição GET.
   * @template T Tipo da resposta esperada.
   * @param endpoint Endpoint relativo da API.
   * @param params Parâmetros de consulta opcionais.
   * @returns Observable com a resposta tipada.
   */
  get<T>(
    endpoint: string,
    params?: Record<string, string | number>,
  ): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(
        () => new Error('Requisição não suportada em ambiente SSR'),
      );
    }
    const options = this.buildOptions({ params });
    return this.http.get<T>(this.buildUrl(endpoint), options);
  }

  /**
   * Realiza uma requisição POST.
   * @template T Tipo da resposta esperada.
   * @param endpoint Endpoint relativo da API.
   * @param body Corpo da requisição.
   * @param headers Cabeçalhos opcionais.
   * @returns Observable com a resposta tipada.
   */
  post<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(
        () => new Error('Requisição não suportada em ambiente SSR'),
      );
    }
    const options = this.buildOptions({ headers });
    return this.http.post<T>(this.buildUrl(endpoint), body, options);
  }

  /**
   * Realiza uma requisição PUT.
   * @template T Tipo da resposta esperada.
   * @param endpoint Endpoint relativo da API.
   * @param body Corpo da requisição.
   * @param headers Cabeçalhos opcionais.
   * @returns Observable com a resposta tipada.
   */
  put<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(
        () => new Error('Requisição não suportada em ambiente SSR'),
      );
    }
    const options = this.buildOptions({ headers });
    return this.http.put<T>(this.buildUrl(endpoint), body, options);
  }

  /**
   * Realiza uma requisição PATCH.
   * @template T Tipo da resposta esperada.
   * @param endpoint Endpoint relativo da API.
   * @param body Corpo da requisição.
   * @param headers Cabeçalhos opcionais.
   * @returns Observable com a resposta tipada.
   */
  patch<T>(
    endpoint: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(
        () => new Error('Requisição não suportada em ambiente SSR'),
      );
    }
    const options = this.buildOptions({ headers });
    return this.http.patch<T>(this.buildUrl(endpoint), body, options);
  }

  /**
   * Realiza uma requisição DELETE.
   * @template T Tipo da resposta esperada.
   * @param endpoint Endpoint relativo da API.
   * @param params Parâmetros de consulta opcionais.
   * @returns Observable com a resposta tipada.
   */
  delete<T>(
    endpoint: string,
    params?: Record<string, string | number>,
  ): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(
        () => new Error('Requisição não suportada em ambiente SSR'),
      );
    }
    const options = this.buildOptions({ params });
    return this.http.delete<T>(this.buildUrl(endpoint), options);
  }

  /**
   * Constrói a URL completa com base na URL base e no endpoint fornecido.
   * @param endpoint Endpoint relativo.
   * @returns URL completa.
   */
  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }

  /**
   * Constrói as opções para requisições HTTP, incluindo cabeçalhos e parâmetros.
   * @param config Configuração contendo headers e params.
   * @returns Objeto de opções para requisição.
   */
  private buildOptions(config: {
    headers?: Record<string, string>;
    params?: Record<string, string | number>;
  }) {
    const headers = new HttpHeaders(config.headers || {});
    const params = new HttpParams({
      fromObject: config.params || {},
    });
    return { headers, params };
  }
}
