import { IsEnum, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { InputType } from '../entities/thought.entity';

export class CreateThoughtDto {
  @IsUUID()
  pageNoteId: string;

  @IsOptional()
  @IsUUID()
  quoteId?: string;

  @IsOptional()
  @IsUUID()
  parentThoughtId?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsEnum(InputType)
  inputType: InputType = InputType.TEXT;

  @IsOptional()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @Min(0)
  depth?: number;
}

export class UpdateThoughtDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsEnum(InputType)
  inputType?: InputType;

  @IsOptional()
  @Min(0)
  orderIndex?: number;
}

export class ThoughtResponseDto {
  id: string;
  pageNoteId: string;
  quoteId?: string;
  parentThoughtId?: string;
  text?: string;
  inputType: InputType;
  orderIndex: number;
  depth: number;
  childThoughts?: ThoughtResponseDto[];
  strokes?: any[];
  createdAt: Date;
  updatedAt: Date;
} 