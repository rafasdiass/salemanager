// src/app/shared/rules/entity-business-rules.interface.ts
export interface EntityBusinessRules<T> {
  prepareForCreate?(entity: T): Promise<T> | T;
  prepareForUpdate?(newEntity: T, oldEntity: T): Promise<T> | T;
}
