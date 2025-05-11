import { Entity, Enum, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';

export enum TokenStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

@Entity()
export class RefreshToken {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  user: User;

  @Property()
  @Unique()
  tokenHash: string;

  @Property({ nullable: true })
  userAgent?: string;

  @Property({ nullable: true })
  ipAddress?: string;

  @Property()
  expiresAt: Date;

  @Property({ nullable: true })
  revokedAt?: Date;

  @Enum(() => TokenStatus)
  status: TokenStatus = TokenStatus.ACTIVE;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(user: User, tokenHash: string, expiresAt: Date) {
    this.user = user;
    this.tokenHash = tokenHash;
    this.expiresAt = expiresAt;
  }

  isRevoked(): boolean {
    return !!this.revokedAt || this.status === TokenStatus.REVOKED;
  }

  isExpired(): boolean {
    return this.expiresAt < new Date() || this.status === TokenStatus.EXPIRED;
  }

  isValid(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }

  revoke(): void {
    this.revokedAt = new Date();
    this.status = TokenStatus.REVOKED;
  }
} 