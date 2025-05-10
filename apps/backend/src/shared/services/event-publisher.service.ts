import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '../interfaces/domain-event.interface';
import { IEventPublisher } from '../interfaces/event-publisher.interface';

/**
 * Service for publishing domain events
 */
@Injectable()
export class EventPublisher implements IEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Publish a domain event
   * @param event Domain event to publish
   */
  publish<T extends DomainEvent>(event: T): void {
    this.eventEmitter.emit(event.eventName, event);
  }
} 