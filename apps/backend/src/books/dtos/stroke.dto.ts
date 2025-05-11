import { IsEnum, IsJSON, IsOptional, IsString, IsUUID } from 'class-validator';
import { SourceType } from '../entities/stroke.entity';

export class CreateStrokeDto {
  @IsUUID()
  thoughtId: string;

  @IsJSON()
  @IsString()
  strokeData: string;

  @IsOptional()
  @IsEnum(SourceType)
  sourceType?: SourceType = SourceType.WEB;
}

export class UpdateStrokeDto {
  @IsOptional()
  @IsJSON()
  @IsString()
  strokeData?: string;

  @IsOptional()
  @IsEnum(SourceType)
  sourceType?: SourceType;
}

export class StrokeResponseDto {
  id: string;
  thoughtId: string;
  strokeData: string;
  sourceType: SourceType;
  createdAt: Date;
  updatedAt: Date;
} 