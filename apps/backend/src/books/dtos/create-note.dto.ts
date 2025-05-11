import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateNoteDto {
  @ApiProperty({
    description: "노트 내용",
    example: "이 부분이 정말 인상적이었다. 특히 저자의 관점이...",
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: "노트 타이틀",
    example: "3장 중요 포인트",
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: "책 페이지 번호",
    example: 42,
    required: false,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: "공개 여부",
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  isPublic?: boolean;
} 