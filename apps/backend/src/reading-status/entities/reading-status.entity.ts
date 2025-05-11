import { User } from '@/auth/entities/user.entity';
import { Book } from '@/books/entities/book.entity';
import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum ReadingState {
  PLANNING = 'planning',
  READING = 'reading',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  ABANDONED = 'abandoned',
}

@Entity()
export class ReadingStatus {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Book)
  book: Book;

  @Enum(() => ReadingState)
  status: ReadingState = ReadingState.PLANNING;

  @Property({ nullable: true })
  currentPage?: number;

  @Property({ nullable: true })
  startedAt?: Date;

  @Property({ nullable: true })
  completedAt?: Date;

  @Property({ nullable: true })
  rating?: number;

  @Property({ nullable: true, type: 'text' })
  review?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 