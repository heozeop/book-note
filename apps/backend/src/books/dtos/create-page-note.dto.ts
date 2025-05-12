import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePageNoteDto {
  @IsNumber()
  @Min(0)
  page: number;

  @IsString()
  content: string;

  @IsUUID()
  userBookId: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
} 