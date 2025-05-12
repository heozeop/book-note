import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BookStatus } from '../modules/book/entities/reading-status.entity';

export class UpdateUserBookDto {
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

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startedAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  finishedAt?: Date;
} 