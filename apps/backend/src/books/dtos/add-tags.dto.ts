import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsString } from "class-validator";

export class AddTagsDto {
  @ApiProperty({
    description: "태그 목록",
    example: ["소설", "자기계발", "프로그래밍"],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  tags: string[];
} 