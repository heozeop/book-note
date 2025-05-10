/**
 * Represents the result of an operation
 */
export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: string | null;
  private readonly _value: T | null;
  
  private constructor(isSuccess: boolean, error: string | null, value: T | null) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
    
    Object.freeze(this);
  }
  
  /**
   * Get the value of a successful result
   */
  public getValue(): T {
    if (this.isFailure) {
      throw new Error(`Cannot get value of failed result: ${this.error}`);
    }
    
    return this._value as T;
  }
  
  /**
   * Create a successful result
   * @param value Result value
   */
  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value !== undefined ? value : null as any);
  }
  
  /**
   * Create a failed result
   * @param error Error message
   */
  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error, null);
  }
  
  /**
   * Combine multiple results into one
   * @param results Results to combine
   */
  public static combine<U>(results: Result<U>[]): Result<U[]> {
    const errors = results.filter(r => r.isFailure).map(r => r.error as string);
    
    if (errors.length > 0) {
      return Result.fail<U[]>(errors.join(', '));
    }
    
    return Result.ok<U[]>(results.map(r => r.getValue()));
  }
} 