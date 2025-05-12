import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards
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
import { BookResponseDto, CollectionResponseDto, CreateCollectionDto, UpdateCollectionDto } from "../dtos";
import { CollectionFacadeService } from "../services/collection-facade.service";

@ApiTags("collections")
@Controller("collections")
@UseGuards(JwtAuthGuard)
export class CollectionController {
  constructor(
    private readonly collectionFacadeService: CollectionFacadeService,
  ) {}

  @ApiOperation({ summary: "컬렉션 생성" })
  @ApiResponse({
    status: 201,
    description: "컬렉션이 성공적으로 생성되었습니다.",
    type: CollectionResponseDto,
  })
  @Post()
  async createCollection(
    @Body() createCollectionDto: CreateCollectionDto,
    @CurrentUser() user: User,
  ): Promise<CollectionResponseDto> {
    return this.collectionFacadeService.createCollection(createCollectionDto, user);
  }

  @ApiOperation({ summary: "모든 컬렉션 조회" })
  @ApiResponse({
    status: 200,
    description: "사용자의 모든 컬렉션이 성공적으로 반환되었습니다.",
    type: [CollectionResponseDto],
  })
  @Get()
  async getAllCollections(
    @CurrentUser() user: User,
  ): Promise<CollectionResponseDto[]> {
    return this.collectionFacadeService.findAllByUserId(user.id);
  }

  @ApiOperation({ summary: "컬렉션 상세 조회" })
  @ApiParam({ name: "id", description: "컬렉션 ID" })
  @ApiResponse({
    status: 200,
    description: "컬렉션이 성공적으로 반환되었습니다.",
    type: CollectionResponseDto,
  })
  @Get(":id")
  async getCollection(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<CollectionResponseDto> {
    return this.collectionFacadeService.findById(id, user.id);
  }

  @ApiOperation({ summary: "컬렉션 수정" })
  @ApiParam({ name: "id", description: "컬렉션 ID" })
  @ApiResponse({
    status: 200,
    description: "컬렉션이 성공적으로 수정되었습니다.",
    type: CollectionResponseDto,
  })
  @Patch(":id")
  async updateCollection(
    @Param("id") id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @CurrentUser() user: User,
  ): Promise<CollectionResponseDto> {
    return this.collectionFacadeService.updateCollection(id, updateCollectionDto, user.id);
  }

  @ApiOperation({ summary: "컬렉션 삭제" })
  @ApiParam({ name: "id", description: "컬렉션 ID" })
  @ApiResponse({
    status: 200,
    description: "컬렉션이 성공적으로 삭제되었습니다.",
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
  @Delete(":id")
  async deleteCollection(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    const result = await this.collectionFacadeService.deleteCollection(id, user.id);
    return { success: result };
  }

  @ApiOperation({ summary: "컬렉션에 책 추가" })
  @ApiParam({ name: "collectionId", description: "컬렉션 ID" })
  @ApiParam({ name: "bookId", description: "책 ID" })
  @ApiResponse({
    status: 201,
    description: "책이 컬렉션에 성공적으로 추가되었습니다.",
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
  @Post(":collectionId/books/:bookId")
  @HttpCode(201)
  async addBookToCollection(
    @Param("collectionId") collectionId: string,
    @Param("bookId") bookId: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    await this.collectionFacadeService.addBookToCollection(collectionId, bookId, user.id);
    return { success: true };
  }

  @ApiOperation({ summary: "컬렉션에서 책 제거" })
  @ApiParam({ name: "collectionId", description: "컬렉션 ID" })
  @ApiParam({ name: "bookId", description: "책 ID" })
  @ApiResponse({
    status: 200,
    description: "책이 컬렉션에서 성공적으로 제거되었습니다.",
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
  @Delete(":collectionId/books/:bookId")
  async removeBookFromCollection(
    @Param("collectionId") collectionId: string,
    @Param("bookId") bookId: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    await this.collectionFacadeService.removeBookFromCollection(collectionId, bookId, user.id);
    return { success: true };
  }

  @ApiOperation({ summary: "컬렉션의 모든 책 조회" })
  @ApiParam({ name: "collectionId", description: "컬렉션 ID" })
  @ApiResponse({
    status: 200,
    description: "컬렉션의 모든 책이 성공적으로 반환되었습니다.",
    type: [BookResponseDto],
  })
  @Get(":collectionId/books")
  async getBooksFromCollection(
    @Param("collectionId") collectionId: string,
    @CurrentUser() user: User,
  ): Promise<BookResponseDto[]> {
    return this.collectionFacadeService.getBooksFromCollection(collectionId, user.id);
  }
} 