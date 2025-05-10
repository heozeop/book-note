import { IValueObject } from '../interfaces/value-object.interface';

/**
 * Base class for value objects
 */
export abstract class ValueObject<T> implements IValueObject<T> {
  constructor(protected readonly _value: T) {}

  /**
   * Get the value of this value object
   */
  public value(): T {
    return this._value;
  }

  /**
   * Check if this value object equals another value object
   * @param vo Value object to compare with
   */
  public equals(vo?: IValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    
    if (vo.value === undefined) {
      return false;
    }
    
    return JSON.stringify(this.value()) === JSON.stringify(vo.value());
  }
} 