import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePageNoteDto {
  @IsUUID()
  userBookId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number;

  @IsOptional()
  @IsString()
  chapter?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}

export class UpdatePageNoteDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number;

  @IsOptional()
  @IsString()
  chapter?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}

export class PageNoteResponseDto {
  id: string;
  userBookId: string;
  page?: number;
  chapter?: string;
  title?: string;
  isPrivate: boolean;
  quotes?: any[]; // QuoteResponseDto[]
  thoughts?: any[]; // ThoughtResponseDto[]
  tags?: any[]; // TagResponseDto[]
  createdAt: Date;
  updatedAt: Date;
} 