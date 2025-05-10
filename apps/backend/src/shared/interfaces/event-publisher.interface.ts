import { DomainEvent } from './domain-event.interface';

/**
 * Interface for publishing domain events
 */
export interface IEventPublisher {
  /**
   * Publish a domain event
   * @param event Domain event to publish
   */
  publish<T extends DomainEvent>(event: T): void;
} 