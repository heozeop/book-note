/**
 * Interface for all value objects
 */
export interface IValueObject<T> {
  /**
   * Get the value of this value object
   */
  value(): T;
  
  /**
   * Check if this value object equals another value object
   * @param vo Value object to compare with
   */
  equals(vo?: IValueObject<T>): boolean;
} 