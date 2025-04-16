// src/app/shared/services/base-firestore-crud.service.ts

import { inject, signal, computed, effect } from '@angular/core';
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
import { toSignal } from '@angular/core/rxjs-interop';

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
  protected readonly _items = signal<T[]>([]);
  readonly items = computed(() => this._items());
  readonly hasItems = computed(() => this._items().length > 0);

  // 🔓 Acesso público para Firestore e referência da coleção
  public readonly firestore: Firestore = inject(Firestore);
  public readonly collectionRef: CollectionReference<DocumentData>;
  protected businessRules?: EntityBusinessRules<T>;

  constructor(public readonly dbPath: string) {
    this.collectionRef = collection(this.firestore, dbPath);
    this.initializeReactiveList();
  }

  listAll(): Observable<T[]> {
    return from(getDocs(this.collectionRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as T)
        )
      )
    );
  }

  getById(id: string): Observable<T> {
    const ref = doc(this.firestore, this.dbPath, id);
    return from(getDoc(ref)).pipe(
      map((docSnap) => {
        if (!docSnap.exists())
          throw new Error(`Documento ${id} não encontrado`);
        return { id: docSnap.id, ...docSnap.data() } as T;
      })
    );
  }

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
        this.refreshList();
        return processed;
      })
    );
  }

  update(id: string, value: T): Observable<string> {
    return from(this.applyBusinessRulesBeforeUpdate(id, value)).pipe(
      switchMap(async (processed) => {
        processed.updatedAt = new Date();
        const ref = doc(this.firestore, this.dbPath, id);
        await updateDoc(ref, processed);
        this.refreshList();
        return id;
      })
    );
  }

  delete(id: string): Observable<string> {
    const ref = doc(this.firestore, this.dbPath, id);
    return from(deleteDoc(ref)).pipe(
      map(() => {
        this.refreshList();
        return id;
      })
    );
  }

  private initializeReactiveList(): void {
    effect(() => {
      this._items.set(toSignal(this.listAll(), { initialValue: [] })());
    });
  }

  private refreshList(): void {
    effect(() => {
      this._items.set(toSignal(this.listAll(), { initialValue: [] })());
    });
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
      const oldValue = await this.getById(id).toPromise();
      if (!oldValue) {
        throw new Error(
          `Entidade com ID ${id} não encontrada para atualização.`
        );
      }
      return await this.businessRules.prepareForUpdate(value, oldValue);
    }
    return value;
  }
}
