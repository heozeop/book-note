import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISBN, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { BookStatus } from '../entities/book.entity';

export class CreateBookDto {
  @ApiProperty({
    description: '책 제목',
    example: '클린 코드',
  })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MaxLength(255, { message: '제목은 255자를 초과할 수 없습니다.' })
  title: string;

  @ApiPropertyOptional({
    description: '책 저자',
    example: '로버트 C. 마틴',
  })
  @IsOptional()
  @IsString({ message: '저자는 문자열이어야 합니다.' })
  @MaxLength(255, { message: '저자는 255자를 초과할 수 없습니다.' })
  author?: string;

  @ApiPropertyOptional({
    description: 'ISBN',
    example: '9788966262878',
  })
  @IsOptional()
  @IsISBN(undefined, { message: '유효한 ISBN 형식이어야 합니다.' })
  isbn?: string;

  @ApiPropertyOptional({
    description: '표지 이미지 URL',
    example: 'https://example.com/cover.jpg',
  })
  @IsOptional()
  @IsString({ message: '표지 이미지 URL은 문자열이어야 합니다.' })
  coverImage?: string;

  @ApiPropertyOptional({
    description: '책 설명',
    example: '프로그래밍 언어와 상관없이 모든 프로그래머가 읽어야 할 필독서...',
  })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description?: string;

  @ApiPropertyOptional({
    description: '출판사',
    example: '인사이트',
  })
  @IsOptional()
  @IsString({ message: '출판사는 문자열이어야 합니다.' })
  @MaxLength(100, { message: '출판사는 100자를 초과할 수 없습니다.' })
  publisher?: string;

  @ApiPropertyOptional({
    description: '출판일',
    example: '2013-12-12',
  })
  @IsOptional()
  publishedDate?: Date;

  @ApiPropertyOptional({
    description: '총 페이지 수',
    example: 584,
  })
  @IsOptional()
  @IsNumber({}, { message: '총 페이지 수는 숫자여야 합니다.' })
  @Min(0, { message: '총 페이지 수는 0 이상이어야 합니다.' })
  totalPages?: number;

  @ApiPropertyOptional({
    description: '책 상태',
    enum: BookStatus,
    example: BookStatus.WANT_TO_READ,
  })
  @IsOptional()
  @IsEnum(BookStatus, { message: '유효한 책 상태가 아닙니다.' })
  status?: BookStatus;

  @ApiPropertyOptional({
    description: '추가 메타데이터',
    example: { genre: '기술', tags: ['프로그래밍', '소프트웨어 공학'] },
  })
  @IsOptional()
  metadata?: Record<string, any>;
} 