/**
 * Interface for query pattern
 */
export interface IQuery<TResult> {
  /**
   * Get the query name
   */
  readonly queryName: string;
} 