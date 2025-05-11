import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateCollectionDto {
  @ApiPropertyOptional({
    description: "컬렉션 이름",
    example: "읽고 싶은 책들",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "컬렉션 설명",
    example: "2023년에 읽고 싶은 책들의 모음",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "커버 이미지 URL",
    example: "https://example.com/images/collection-cover.jpg",
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;
} 