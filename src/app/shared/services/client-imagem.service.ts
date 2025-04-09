import { Injectable, WritableSignal, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class clientImagemService {
  private readonly endpoint = 'clients/imagens';

  /** Signals para armazenar o estado das imagens */
  public imagens: WritableSignal<string[]> = signal([]);
  public hasImages: WritableSignal<boolean> = signal(false);
  public isLoading: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string | null> = signal(null);

  private apiService = inject(ApiService);

  constructor() {}

  /**
   * Carrega as imagens da cota do client e atualiza os signals `imagens`, `hasImages` e `isLoading`.
   * @param clientId O ID do client.
   */
  async loadImagensByclientId(clientId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const imagens = await this.apiService
        .get<string[]>(`${this.endpoint}/${clientId}`)
        .toPromise();

      if (imagens && imagens.length > 0) {
        this.imagens.set(imagens);
        this.hasImages.set(true);
        console.log('✅ Imagens carregadas:', imagens);
      } else {
        this.imagens.set([]);
        this.hasImages.set(false);
        console.warn('⚠️ Nenhuma imagem encontrada.');
      }
    } catch (err) {
      const error = err as HttpErrorResponse;
      if (error.status === 404) {
        console.warn('⚠️ Nenhuma imagem encontrada no backend.');
        this.imagens.set([]);
        this.hasImages.set(false);
      } else {
        console.error('❌ Erro ao carregar imagens do client:', error);
        this.errorMessage.set('Erro ao carregar imagens.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtém a lista de imagens armazenadas no signal `imagens`.
   * @returns Um array de URLs das imagens ou um array vazio se não houver imagens.
   */
  getImagens(): string[] {
    return this.imagens();
  }

  /**
   * Adiciona uma nova imagem à lista do client.
   * @param imagemUrl URL da imagem a ser adicionada.
   */
  addImagem(imagemUrl: string): void {
    this.imagens.set([...this.imagens(), imagemUrl]);
    this.hasImages.set(true);
    console.log(`📸 Imagem adicionada: ${imagemUrl}`);
  }

  /**
   * Remove uma imagem da lista do client.
   * Se não restarem imagens, `hasImages` será atualizado para `false`.
   * @param imagemUrl URL da imagem a ser removida.
   */
  removeImagem(imagemUrl: string): void {
    const novaLista = this.imagens().filter((img) => img !== imagemUrl);
    this.imagens.set(novaLista);
    this.hasImages.set(novaLista.length > 0);
    console.log(`🗑️ Imagem removida: ${imagemUrl}`);
  }

  /**
   * Limpa todas as imagens armazenadas no signal `imagens`.
   * Também define `hasImages` como `false`.
   */
  clearImagens(): void {
    this.imagens.set([]);
    this.hasImages.set(false);
    console.log('🧹 Todas as imagens foram removidas.');
  }
}
