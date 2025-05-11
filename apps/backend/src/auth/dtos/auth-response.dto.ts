import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { AuthTokenDto } from './auth-token.dto';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: AuthTokenDto })
  token: AuthTokenDto;

  /**
   * User 엔티티와 토큰 정보로 AuthResponseDto를 생성합니다.
   * @param user User 엔티티
   * @param accessToken 액세스 토큰
   * @param refreshToken 리프레시 토큰 (선택적)
   * @returns AuthResponseDto 객체
   */
  static create(
    user: User,
    accessToken: string,
    refreshToken?: string,
  ): AuthResponseDto {
    const response = new AuthResponseDto();
    response.user = UserResponseDto.fromEntity(user);
    
    const token = new AuthTokenDto();
    token.accessToken = accessToken;
    token.refreshToken = refreshToken;
    token.expiresIn = 3600; // 1시간 (초 단위)
    token.tokenType = 'Bearer';
    
    response.token = token;
    
    return response;
  }
} 