import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsISBN, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { BookStatus } from '../modules/book/entities/reading-status.entity';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subTitle?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsISBN()
  isbn?: string;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  publishedDate?: Date;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  pageCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  externalId?: string;
  
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
} 