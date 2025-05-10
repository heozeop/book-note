/**
 * Interface for domain events
 */
export interface DomainEvent {
  /**
   * Unique name of the event
   */
  readonly eventName: string;
  
  /**
   * When the event occurred
   */
  readonly occurredAt: Date;
} 