import { IQuery } from './query.interface';

/**
 * Interface for query handler pattern
 */
export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  /**
   * Execute the query
   * @param query Query to execute
   */
  execute(query: TQuery): Promise<TResult>;
} 