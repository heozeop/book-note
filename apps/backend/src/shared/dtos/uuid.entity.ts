import { PrimaryKey } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { BaseEntity } from './base.entity';

/**
 * Base entity class with UUID as primary key
 */
export abstract class UuidEntity extends BaseEntity<string> {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();
} 