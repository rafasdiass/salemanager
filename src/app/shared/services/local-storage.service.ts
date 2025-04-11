import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface ExpiringItem<T> {
  value: T;
  expiry: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private checkLocalStorage(): boolean {
    if (!this.isBrowser()) return false;
    try {
      localStorage.setItem('__storage_test__', 'test');
      localStorage.removeItem('__storage_test__');
      return true;
    } catch (error) {
      console.warn('LocalStorage não é suportado ou está desabilitado.');
      return false;
    }
  }

  // Método interno para salvar um item (já convertido para string)
  private setItemInternal(key: string, data: any): void {
    if (this.checkLocalStorage()) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error(`Erro ao salvar a chave ${key} no localStorage:`, error);
      }
    }
  }

  // Método interno para obter um item e convertê-lo de volta
  private getItemInternal<T>(key: string): T | null {
    if (this.checkLocalStorage()) {
      try {
        const itemStr = localStorage.getItem(key);
        return itemStr ? (JSON.parse(itemStr) as T) : null;
      } catch (error) {
        console.error(`Erro ao ler a chave ${key} do localStorage:`, error);
        return null;
      }
    }
    return null;
  }

  /**
   * Salva dados no localStorage.
   * @param key Chave de armazenamento.
   * @param data Dados a serem armazenados.
   * @param ttl (Opcional) Tempo de expiração em milissegundos.
   */
  public setItem<T>(key: string, data: T, ttl?: number): void {
    if (ttl && ttl > 0) {
      const item: ExpiringItem<T> = {
        value: data,
        expiry: new Date().getTime() + ttl,
      };
      this.setItemInternal(key, item);
    } else {
      this.setItemInternal(key, data);
    }
  }

  /**
   * Obtém dados do localStorage.
   * @param key Chave de armazenamento.
   * @param ttlCheck Se verdadeiro, verifica a expiração do item.
   * @returns Os dados armazenados ou null se não encontrados ou expirados.
   */
  public getItem<T>(key: string, ttlCheck: boolean = false): T | null {
    if (ttlCheck) {
      const item = this.getItemInternal<ExpiringItem<T>>(key);
      if (item) {
        const now = new Date().getTime();
        if (now > item.expiry) {
          this.removeItem(key);
          return null;
        }
        return item.value;
      }
      return null;
    } else {
      return this.getItemInternal<T>(key);
    }
  }

  /**
   * Remove os dados associados à chave especificada.
   * @param key Chave a ser removida.
   */
  public removeItem(key: string): void {
    if (this.checkLocalStorage()) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Erro ao remover a chave ${key} do localStorage:`, error);
      }
    }
  }
}
