import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsISBN, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { BookStatus } from '../entities/book.entity';

@InputType()
export class CreateBookInput {
  @Field()
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MaxLength(255, { message: '제목은 255자를 초과할 수 없습니다.' })
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '저자는 문자열이어야 합니다.' })
  @MaxLength(255, { message: '저자는 255자를 초과할 수 없습니다.' })
  author?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsISBN(undefined, { message: '유효한 ISBN 형식이어야 합니다.' })
  isbn?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '표지 이미지 URL은 문자열이어야 합니다.' })
  coverImage?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '출판사는 문자열이어야 합니다.' })
  @MaxLength(100, { message: '출판사는 100자를 초과할 수 없습니다.' })
  publisher?: string;

  @Field({ nullable: true })
  @IsOptional()
  publishedDate?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: '총 페이지 수는 숫자여야 합니다.' })
  @Min(0, { message: '총 페이지 수는 0 이상이어야 합니다.' })
  totalPages?: number;

  @Field(() => BookStatus, { nullable: true })
  @IsOptional()
  @IsEnum(BookStatus, { message: '유효한 책 상태가 아닙니다.' })
  status?: BookStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
} 