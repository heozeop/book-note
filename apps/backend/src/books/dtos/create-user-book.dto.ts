import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BookStatus } from '../modules/book/entities/reading-status.entity';

export class CreateUserBookDto {
  @IsNotEmpty()
  @IsString()
  bookId: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rating?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  boughtAt?: Date;

  @IsOptional()
  @IsString()
  userNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentPage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rereadCount?: number;
} 