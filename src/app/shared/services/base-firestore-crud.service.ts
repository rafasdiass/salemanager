// src/app/shared/services/base-firestore-crud.service.ts

import { inject, signal, computed } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  CollectionReference,
  DocumentData,
} from '@angular/fire/firestore';
import { Observable, from, switchMap, map } from 'rxjs';

/**
 * Interface para timestamps automáticos nas entidades.
 */
export interface Timestamps {
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para definir os hooks de regras de negócio aplicáveis a uma entidade.
 */
export interface EntityBusinessRules<T> {
  prepareForCreate?(value: T): Promise<T> | T;
  prepareForUpdate?(newValue: T, oldValue: T): Promise<T> | T;
}

/**
 * Serviço base genérico com reatividade moderna (signals), integração com Firestore
 * e suporte a validação de regras de negócio antes das operações.
 */
export abstract class BaseFirestoreCrudService<
  T extends { id?: string } & Partial<Timestamps>
> {
  // 🎯 sinal que guarda a lista atual
  protected readonly _items = signal<T[]>([]);
  readonly items = computed(() => this._items());
  readonly hasItems = computed(() => this.items().length > 0);

  // 🔓 injeta o Firestore e monta a referência da coleção
  public readonly firestore: Firestore = inject(Firestore);
  public readonly collectionRef: CollectionReference<DocumentData>;

  protected businessRules?: EntityBusinessRules<T>;

  constructor(public readonly dbPath: string) {
    this.collectionRef = collection(this.firestore, dbPath);
    // popula a lista imediatamente
    this.loadItems().catch(console.error);
  }

  /**
   * Retorna um Observable que emite TODOS os documentos (um fetch one-shot).
   */
  listAll(): Observable<T[]> {
    return from(getDocs(this.collectionRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as T)
        )
      )
    );
  }

  /**
   * Busca um documento por ID (one-shot).
   */
  getById(id: string): Observable<T> {
    const ref = doc(this.firestore, this.dbPath, id);
    return from(getDoc(ref)).pipe(
      map((docSnap) => {
        if (!docSnap.exists()) {
          throw new Error(`Documento ${id} não encontrado`);
        }
        return { id: docSnap.id, ...docSnap.data() } as T;
      })
    );
  }

  /**
   * Cria um novo documento, aplica regras de negócio, atualiza timestamps e faz refresh da lista.
   */
  create(value: T, id?: string): Observable<T> {
    return from(this.applyBusinessRulesBeforeCreate(value)).pipe(
      switchMap(async (processed) => {
        const now = new Date();
        processed.createdAt = now;
        processed.updatedAt = now;

        const docId = id || crypto.randomUUID();
        const ref = doc(this.firestore, this.dbPath, docId);
        await setDoc(ref, processed);

        processed.id = docId;
        // 🔄 refresh manual
        await this.loadItems();
        return processed;
      })
    );
  }

  /**
   * Atualiza documento por ID, aplica regras de negócio, ajusta timestamp e faz refresh da lista.
   */
  update(id: string, value: T): Observable<string> {
    return from(this.applyBusinessRulesBeforeUpdate(id, value)).pipe(
      switchMap(async (processed) => {
        processed.updatedAt = new Date();
        const ref = doc(this.firestore, this.dbPath, id);
        await updateDoc(ref, processed);

        // 🔄 refresh manual
        await this.loadItems();
        return id;
      })
    );
  }

  /**
   * Deleta documento por ID e faz refresh da lista.
   */
  delete(id: string): Observable<string> {
    const ref = doc(this.firestore, this.dbPath, id);
    return from(deleteDoc(ref)).pipe(
      switchMap(async () => {
        // 🔄 refresh manual
        await this.loadItems();
        return id;
      })
    );
  }

  /**
   * Método interno para recarregar todos os itens no sinal.
   */
  private async loadItems(): Promise<void> {
    const snapshot = await getDocs(this.collectionRef);
    const data = snapshot.docs.map(
      (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as T)
    );
    this._items.set(data);
  }

  private async applyBusinessRulesBeforeCreate(value: T): Promise<T> {
    if (this.businessRules?.prepareForCreate) {
      return await this.businessRules.prepareForCreate(value);
    }
    return value;
  }

  private async applyBusinessRulesBeforeUpdate(
    id: string,
    value: T
  ): Promise<T> {
    if (this.businessRules?.prepareForUpdate) {
      // obtém o valor antigo para comparação
      const old = await this.getById(id).toPromise();
      if (!old) {
        throw new Error(
          `Entidade com ID ${id} não encontrada para atualização.`
        );
      }
      return await this.businessRules.prepareForUpdate(value, old);
    }
    return value;
  }
}
