import { ApiProperty } from '@nestjs/swagger';
import { User, UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: '사용자 고유 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '사용자 표시 이름',
    example: 'John Doe',
  })
  displayName: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  profileImage?: string;

  @ApiProperty({
    description: '이메일 인증 여부',
    example: true,
  })
  isVerified: boolean;

  @ApiProperty({
    description: '계정 생성 일시',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  /**
   * User 엔티티를 UserResponseDto로 변환합니다.
   * @param user User 엔티티
   * @returns UserResponseDto 객체
   */
  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.displayName = user.displayName;
    dto.role = user.role;
    dto.profileImage = user.profileImage;
    dto.isVerified = !!user.verifiedAt;
    dto.createdAt = user.createdAt;
    return dto;
  }
} 