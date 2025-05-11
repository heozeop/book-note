import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { RefreshToken, TokenStatus } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor(protected readonly em: EntityManager) {
    super(em, 'RefreshToken');
  }

  /**
   * 토큰 해시로 리프레시 토큰을 찾습니다.
   * @param tokenHash 해시된 토큰 문자열
   * @returns 리프레시 토큰 객체 또는 null
   */
  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.findOne({ tokenHash });
  }

  /**
   * 유효한 리프레시 토큰을 찾습니다.
   * @param tokenHash 해시된 토큰 문자열
   * @returns 리프레시 토큰 객체 또는 null
   */
  async findValidToken(tokenHash: string): Promise<RefreshToken | null> {
    const token = await this.findOne({ 
      tokenHash,
      status: TokenStatus.ACTIVE,
      expiresAt: { $gt: new Date() }
    });
    
    return token;
  }

  /**
   * 특정 사용자의 모든 리프레시 토큰을 찾습니다.
   * @param userId 사용자 ID
   * @returns 리프레시 토큰 객체 배열
   */
  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return this.find({ 
      user: userId 
    });
  }

  /**
   * 특정 사용자의 모든 유효한 리프레시 토큰을 찾습니다.
   * @param userId 사용자 ID
   * @returns 리프레시 토큰 객체 배열
   */
  async findValidTokensByUserId(userId: string): Promise<RefreshToken[]> {
    return this.find({ 
      user: userId,
      status: TokenStatus.ACTIVE,
      expiresAt: { $gt: new Date() }
    });
  }

  /**
   * 특정 사용자의 모든 리프레시 토큰을 취소합니다.
   * @param userId 사용자 ID
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    const tokens = await this.findByUserId(userId);
    const now = new Date();
    
    for (const token of tokens) {
      token.status = TokenStatus.REVOKED;
      token.revokedAt = now;
    }
    
    await this.flush();
  }
  
  /**
   * 엔티티를 영속화하고 변경사항을 저장합니다.
   * @param refreshToken 저장할 리프레시 토큰
   */
  async persistAndFlush(refreshToken: RefreshToken): Promise<void> {
    this.getEntityManager().persist(refreshToken);
    await this.getEntityManager().flush();
  }
  
  /**
   * 변경사항을 저장합니다.
   */
  async flush(): Promise<void> {
    await this.getEntityManager().flush();
  }
} 