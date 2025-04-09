import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  // Fallback para SSR: objeto em memória para armazenar dados temporariamente no servidor.
  private serverStorage: Map<string, string> = new Map();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  /**
   * Verifica se a aplicação está sendo executada no navegador.
   * Se estiver em SSR (Server-Side Rendering), retorna false.
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Salva um item no localStorage ou no fallback em memória para SSR.
   * @param key Chave do item.
   * @param value Valor do item.
   */
  setItem<T>(key: string, value: T): void {
    const data = JSON.stringify(value);
    if (this.isBrowser()) {
      localStorage.setItem(key, data);
      console.log(`[LocalStorageService] Item salvo no localStorage: ${key}`);
    } else {
      this.serverStorage.set(key, data);
      console.log(`[LocalStorageService] Item salvo no fallback SSR: ${key}`);
    }
  }

  /**
   * Recupera um item do localStorage ou do fallback em memória para SSR.
   * @param key Chave do item.
   * @returns Valor do item ou `null` se não existir ou for inválido.
   */
  getItem<T>(key: string): T | null {
    const data = this.isBrowser()
      ? localStorage.getItem(key)
      : this.serverStorage.get(key);

    if (data && this.isValidJSON(data)) {
      console.log(`🔍 Recuperando ${key} do localStorage:`, JSON.parse(data));
      return JSON.parse(data) as T;
    } else {
      console.warn(`⚠️ Nenhum dado encontrado para ${key} no localStorage.`);
    }
    return null;
  }

  /**
   * Remove um item do localStorage ou do fallback em memória para SSR.
   * @param key Chave do item.
   */
  removeItem(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
      console.log(
        `[LocalStorageService] Item removido do localStorage: ${key}`,
      );
    } else {
      this.serverStorage.delete(key);
      console.log(
        `[LocalStorageService] Item removido do fallback SSR: ${key}`,
      );
    }
  }

  /**
   * Limpa todos os itens do localStorage ou do fallback em memória para SSR.
   */
  clear(): void {
    if (this.isBrowser()) {
      localStorage.clear();
      console.log(
        '[LocalStorageService] Todos os itens foram removidos do localStorage.',
      );
    } else {
      this.serverStorage.clear();
      console.log(
        '[LocalStorageService] Todos os itens foram removidos do fallback SSR.',
      );
    }
  }

  /**
   * Verifica se uma string é um JSON válido.
   * @param data String a ser validada.
   * @returns Verdadeiro se for um JSON válido, falso caso contrário.
   */
  private isValidJSON(data: string): boolean {
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Recupera um item do localStorage de forma assíncrona.
   * @param key Chave do item.
   * @returns Observable com o valor do item ou `null`.
   */
  getItemAsync<T>(key: string): Observable<T | null> {
    return new Observable((observer: Observer<T | null>) => {
      const data = this.getItem<T>(key);
      observer.next(data);
      observer.complete();
    });
  }
}
