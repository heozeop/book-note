import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { BookStatus } from "../entities/reading-status.entity";

export class CreateUserBookDto {
  @IsNotEmpty()
  @IsUUID()
  bookId: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  rating?: number;

  @IsOptional()
  @IsDateString()
  boughtAt?: Date;

  @IsOptional()
  @IsString()
  userNotes?: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus = BookStatus.WANT_TO_READ;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentPage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rereadCount?: number = 0;
} 