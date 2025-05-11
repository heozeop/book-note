import { IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateQuoteDto {
  @IsUUID()
  pageNoteId: string;

  @IsString()
  text: string;

  @IsOptional()
  @Min(0)
  orderIndex?: number;
}

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @Min(0)
  orderIndex?: number;
}

export class QuoteResponseDto {
  id: string;
  pageNoteId: string;
  text: string;
  orderIndex: number;
  thoughts?: any[]; // ThoughtResponseDto[]
  createdAt: Date;
  updatedAt: Date;
} 