import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../entities/user.entity';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { PasswordService } from './password.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 리프레시 토큰을 생성합니다.
   * @param user 토큰을 생성할 사용자
   * @param userAgent 사용자 에이전트 정보
   * @param ipAddress IP 주소
   * @returns 생성된 토큰과 해당 객체
   */
  async createRefreshToken(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ token: string; refreshToken: RefreshToken }> {
    // 토큰 만료 시간 설정
    const expiryDays = this.configService.get<number>('app.jwt.refreshTokenExpiryDays', 7);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // 랜덤 토큰 생성
    const token = this.passwordService.generateSecureToken();
    const tokenHash = await this.hashToken(token);

    // 리프레시 토큰 객체 생성
    const refreshToken = new RefreshToken(user, tokenHash, expiresAt);
    
    if (userAgent) {
      refreshToken.userAgent = userAgent;
    }
    
    if (ipAddress) {
      refreshToken.ipAddress = ipAddress;
    }

    // 데이터베이스에 저장
    await this.refreshTokenRepository.persistAndFlush(refreshToken);

    return {
      token,
      refreshToken,
    };
  }

  /**
   * 리프레시 토큰을 검증합니다.
   * @param token 검증할 토큰 문자열
   * @returns 검증된 리프레시 토큰 객체 또는 null
   */
  async verifyRefreshToken(token: string): Promise<RefreshToken | null> {
    const tokenHash = await this.hashToken(token);
    const refreshToken = await this.refreshTokenRepository.findValidToken(tokenHash);
    
    if (!refreshToken) {
      return null;
    }
    
    // 토큰이 유효한지 검사
    if (!refreshToken.isValid()) {
      return null;
    }
    
    return refreshToken;
  }

  /**
   * 리프레시 토큰을 취소합니다.
   * @param token 취소할 토큰 문자열
   * @returns 성공 여부
   */
  async revokeRefreshToken(token: string): Promise<boolean> {
    const tokenHash = await this.hashToken(token);
    const refreshToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);
    
    if (!refreshToken) {
      return false;
    }
    
    refreshToken.revoke();
    await this.refreshTokenRepository.flush();
    
    return true;
  }

  /**
   * 특정 사용자의 모든 리프레시 토큰을 취소합니다.
   * @param userId 사용자 ID
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(userId);
  }

  /**
   * 특정 사용자의 모든 유효한 리프레시 토큰을 가져옵니다.
   * @param userId 사용자 ID
   * @returns 유효한 리프레시 토큰 배열
   */
  async getValidTokensForUser(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.findValidTokensByUserId(userId);
  }

  /**
   * 토큰을 해싱합니다.
   * @param token 해싱할 토큰 문자열
   * @returns 해시된 토큰
   */
  private async hashToken(token: string): Promise<string> {
    return this.passwordService.hashPassword(token);
  }
} 