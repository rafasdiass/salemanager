export interface EntityBusinessRules<T> {
  prepareForCreate?(entity: T): Promise<T>;
  prepareForUpdate?(newEntity: T, oldEntity: T): Promise<T>;
  prepareForDelete?(entity: T): Promise<T>;
}
