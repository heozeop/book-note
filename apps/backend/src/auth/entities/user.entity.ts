import { Entity, Enum, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryKey()
  id: string = v4();

  @Property()
  @Unique()
  email: string;

  @Property({ hidden: true })
  passwordHash: string;

  @Property()
  displayName: string;

  @Property({ nullable: true })
  profileImage?: string;

  @Property({ type: 'json', nullable: true })
  preferences?: Record<string, any>;

  @Property({ nullable: true })
  timezone?: string;

  @Enum(() => UserRole)
  role: UserRole = UserRole.USER;

  @Property({ nullable: true })
  verifiedAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 