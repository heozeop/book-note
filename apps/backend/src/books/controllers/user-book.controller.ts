import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateUserBookDto, UserBookResponseDto } from "../dtos";
import { BookStatus } from "../modules/book/entities/reading-status.entity";
import { UserBookFacadeService } from "../services/user-book-facade.service";

@ApiTags("user-books")
@Controller("user-books")
@UseGuards(JwtAuthGuard)
export class UserBookController {
  constructor(private readonly userBookFacadeService: UserBookFacadeService) {}

  @ApiOperation({ summary: "사용자 책 등록" })
  @ApiResponse({
    status: 201,
    description: "사용자 책이 성공적으로 등록되었습니다.",
    type: UserBookResponseDto,
  })
  @Post()
  async createUserBook(
    @Body() createUserBookDto: CreateUserBookDto,
    @CurrentUser() user: User,
  ): Promise<UserBookResponseDto> {
    return this.userBookFacadeService.createUserBook(createUserBookDto, user);
  }

  @ApiOperation({ summary: "사용자의 모든 책 조회" })
  @ApiQuery({
    name: "status",
    required: false,
    description: "필터링할 독서 상태",
    enum: BookStatus,
  })
  @ApiResponse({
    status: 200,
    description: "사용자 책 목록이 성공적으로 조회되었습니다.",
    type: [UserBookResponseDto],
  })
  @Get()
  async getUserBooks(
    @CurrentUser() user: User,
    @Query("status") status?: BookStatus,
  ): Promise<UserBookResponseDto[]> {
    if (status) {
      return this.userBookFacadeService.findUserBooksByStatus(status, user.id);
    }
    return this.userBookFacadeService.findAllUserBooks(user.id);
  }

  @ApiOperation({ summary: "특정 사용자 책 조회" })
  @ApiParam({ name: "id", description: "사용자 책 ID" })
  @ApiResponse({
    status: 200,
    description: "사용자 책이 성공적으로 조회되었습니다.",
    type: UserBookResponseDto,
  })
  @Get(":id")
  async getUserBook(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<UserBookResponseDto> {
    return this.userBookFacadeService.findUserBookById(id, user.id);
  }

  @ApiOperation({ summary: "사용자 책 상태 업데이트" })
  @ApiParam({ name: "id", description: "사용자 책 ID" })
  @ApiParam({ name: "status", description: "변경할 상태", enum: BookStatus })
  @ApiResponse({
    status: 200,
    description: "사용자 책 상태가 성공적으로 업데이트되었습니다.",
    type: UserBookResponseDto,
  })
  @Put(":id/status/:status")
  async updateUserBookStatus(
    @Param("id") id: string,
    @Param("status") status: BookStatus,
    @CurrentUser() user: User,
  ): Promise<UserBookResponseDto> {
    return this.userBookFacadeService.updateUserBookStatus(id, status, user.id);
  }

  @ApiOperation({ summary: "사용자 책 삭제" })
  @ApiParam({ name: "id", description: "사용자 책 ID" })
  @ApiResponse({
    status: 200,
    description: "사용자 책이 성공적으로 삭제되었습니다.",
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
  async deleteUserBook(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    const result = await this.userBookFacadeService.deleteUserBook(id, user.id);
    return { success: result };
  }
} 