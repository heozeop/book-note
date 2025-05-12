import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePageNoteDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  page?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
} 