import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AddTagsDto, TagResponseDto } from "../dtos";
import { TagFacadeService } from "../services/tag-facade.service";

@ApiTags("tags")
@Controller("tags")
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(
    private readonly tagFacadeService: TagFacadeService,
  ) {}

  @ApiOperation({ summary: "모든 태그 조회" })
  @ApiResponse({
    status: 200,
    description: "사용자의 모든 태그가 성공적으로 반환되었습니다.",
    type: [TagResponseDto],
  })
  @Get()
  async getAllTags(@CurrentUser() user: User): Promise<TagResponseDto[]> {
    return this.tagFacadeService.findAllByUserId(user.id);
  }
}

@ApiTags("books/tags")
@Controller("books/:bookId/tags")
@UseGuards(JwtAuthGuard)
export class BookTagController {
  constructor(
    private readonly tagFacadeService: TagFacadeService,
  ) {}

  @ApiOperation({ summary: "책에 태그 추가" })
  @ApiParam({ name: "bookId", description: "책 ID" })
  @ApiResponse({
    status: 201,
    description: "태그가 책에 성공적으로 추가되었습니다.",
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        }
      }
    }
  })
  @Post()
  async addTagsToBook(
    @Param("bookId") bookId: string,
    @Body() addTagsDto: AddTagsDto,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    await this.tagFacadeService.addTagsToBook(bookId, addTagsDto.tags, user.id);
    return { success: true };
  }

  @ApiOperation({ summary: "책에서 태그 제거" })
  @ApiParam({ name: "bookId", description: "책 ID" })
  @ApiParam({ name: "tagName", description: "태그 이름" })
  @ApiResponse({
    status: 200,
    description: "태그가 책에서 성공적으로 제거되었습니다.",
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        }
      }
    }
  })
  @Delete(":tagName")
  async removeTagFromBook(
    @Param("bookId") bookId: string,
    @Param("tagName") tagName: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    await this.tagFacadeService.removeTagFromBook(bookId, tagName, user.id);
    return { success: true };
  }
} 