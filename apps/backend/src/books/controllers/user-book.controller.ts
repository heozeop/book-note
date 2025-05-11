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
import { CreateUserBookDto } from "../dtos/create-user-book.dto";
import { BookStatus } from "../entities/reading-status.entity";
import { UserBook } from "../entities/user-book.entity";
import { UserBookService } from "../services/user-book.service";

@ApiTags("user-books")
@Controller("user-books")
@UseGuards(JwtAuthGuard)
export class UserBookController {
  constructor(private readonly userBookService: UserBookService) {}

  @ApiOperation({ summary: "사용자 책 등록" })
  @ApiResponse({
    status: 201,
    description: "사용자 책이 성공적으로 등록되었습니다.",
  })
  @Post()
  async createUserBook(
    @Body() createUserBookDto: CreateUserBookDto,
    @CurrentUser() user: User,
  ): Promise<UserBook> {
    return this.userBookService.createUserBook(createUserBookDto, user);
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
  })
  @Get()
  async getUserBooks(
    @CurrentUser() user: User,
    @Query("status") status?: BookStatus,
  ): Promise<UserBook[]> {
    if (status) {
      return this.userBookService.findUserBooksByStatus(status, user.id);
    }
    return this.userBookService.findAllUserBooks(user.id);
  }

  @ApiOperation({ summary: "특정 사용자 책 조회" })
  @ApiParam({ name: "id", description: "사용자 책 ID" })
  @ApiResponse({
    status: 200,
    description: "사용자 책이 성공적으로 조회되었습니다.",
  })
  @Get(":id")
  async getUserBook(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<UserBook> {
    return this.userBookService.findUserBookById(id, user.id);
  }

  @ApiOperation({ summary: "사용자 책 상태 업데이트" })
  @ApiParam({ name: "id", description: "사용자 책 ID" })
  @ApiParam({ name: "status", description: "변경할 상태", enum: BookStatus })
  @ApiResponse({
    status: 200,
    description: "사용자 책 상태가 성공적으로 업데이트되었습니다.",
  })
  @Put(":id/status/:status")
  async updateUserBookStatus(
    @Param("id") id: string,
    @Param("status") status: BookStatus,
    @CurrentUser() user: User,
  ): Promise<UserBook> {
    return this.userBookService.updateUserBookStatus(id, status, user.id);
  }

  @ApiOperation({ summary: "사용자 책 삭제" })
  @ApiParam({ name: "id", description: "사용자 책 ID" })
  @ApiResponse({
    status: 200,
    description: "사용자 책이 성공적으로 삭제되었습니다.",
  })
  @Delete(":id")
  async deleteUserBook(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    const result = await this.userBookService.deleteUserBook(id, user.id);
    return { success: result };
  }
} 