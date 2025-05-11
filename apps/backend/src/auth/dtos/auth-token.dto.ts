import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthTokenDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiPropertyOptional({
    description: '리프레시 토큰 (HTTP-only 쿠키로 설정됨)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken?: string;

  @ApiProperty({
    description: '토큰 만료 시간 (초)',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: '토큰 타입',
    example: 'Bearer',
  })
  tokenType: string = 'Bearer';
} 