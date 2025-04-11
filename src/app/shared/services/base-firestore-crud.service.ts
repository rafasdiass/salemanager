// src/app/shared/services/base-firestore-crud.service.ts

import { inject, signal, computed, effect } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirestoreCrudService } from 'firestore-crud-lib';
import { Observable, from, switchMap } from 'rxjs';
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
 * Serviço base genérico com reatividade moderna (signals), integração com FirestoreCrudLib
 * e suporte a validação de regras de negócio antes das operações.
 */
export abstract class BaseFirestoreCrudService<
  T extends { id?: string } & Partial<Timestamps>
> extends FirestoreCrudService<T> {
  protected readonly _items = signal<T[]>([]);
  readonly items = computed(() => this._items());
  readonly hasItems = computed(() => this._items().length > 0);

  protected readonly db = inject(AngularFirestore);
  protected businessRules?: EntityBusinessRules<T>;

  constructor(dbPath: string) {
    super(dbPath, inject(AngularFirestore));
    this.initializeReactiveList();
  }

  override listAll(): Observable<T[]> {
    return super.listAll();
  }

  override getById(id: string): Observable<T> {
    return super.getById(id);
  }

  override create(value: T, id?: string): Observable<T> {
    return from(this.applyBusinessRulesBeforeCreate(value)).pipe(
      switchMap((processed) => {
        const result = super.create(processed, id);
        this.refreshList();
        return result;
      })
    );
  }

  override update(id: string, value: T): Observable<string> {
    return from(this.applyBusinessRulesBeforeUpdate(id, value)).pipe(
      switchMap((processed) => {
        const result = super.update(id, processed);
        this.refreshList();
        return result;
      })
    );
  }

  override delete(id: string): Observable<string> {
    const result = super.delete(id);
    this.refreshList();
    return result;
  }

  /**
   * Inicializa a lista reativa com os dados da coleção Firestore.
   */
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
