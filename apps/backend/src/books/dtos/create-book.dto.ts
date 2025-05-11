import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsISBN,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min
} from "class-validator";

export class CreateBookDto {
  @ApiProperty({
    description: "책 제목",
    example: "클린 코드",
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: "책 부제목",
    example: "클린 코드의 모든 것",
  })
  @IsOptional()
  @IsString()
  subTitle?: string;

  @ApiPropertyOptional({
    description: "책 저자",
    example: "로버트 C. 마틴",
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: "ISBN",
    example: "9788966262878",
  })
  @IsOptional()
  @IsISBN()
  isbn?: string;

  @ApiPropertyOptional({
    description: "표지 이미지 URL",
    example: "https://example.com/cover.jpg",
  })
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional({
    description: "책 설명",
    example: "프로그래밍 언어와 상관없이 모든 프로그래머가 읽어야 할 필독서...",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "출판일",
    example: "2013-12-12",
  })
  @IsOptional()
  @IsDateString()
  publishedDate?: Date;

  @ApiPropertyOptional({
    description: "출판사",
    example: "인사이트",
  })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional({
    description: "총 페이지 수",
    example: 584,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pageCount?: number;

  @ApiPropertyOptional({
    description: "가격",
    example: 25000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: "할인율",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({
    description: "언어",
    example: "한국어",
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: "추가 메타데이터",
    example: { genre: "기술", tags: ["프로그래밍", "소프트웨어 공학"] },
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: "외부 책 ID",
    example: "123456789",
  })
  @IsOptional()
  @IsString()
  externalId?: string;
}
