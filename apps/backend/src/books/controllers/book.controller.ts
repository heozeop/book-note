import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { GetUser } from "../../auth/decorators/get-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateBookDto } from "../dtos/create-book.dto";
import { UpdateBookDto } from "../dtos/update-book.dto";
import { Book, BookStatus } from "../entities/book.entity";
import { BookService } from "../services/book.service";

@ApiTags("books")
@Controller("books")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: "새 책 등록" })
  @ApiResponse({
    status: 201,
    description: "책이 성공적으로 등록되었습니다.",
    type: Book,
  })
  async createBook(
    @Body() createBookDto: CreateBookDto,
    @GetUser() user: User,
  ): Promise<Book> {
    return this.bookService.createBook(createBookDto, user);
  }

  @Get()
  @ApiOperation({ summary: "모든 책 조회" })
  @ApiResponse({
    status: 200,
    description: "사용자의 모든 책 목록",
    type: [Book],
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: BookStatus,
    description: "책 상태로 필터링",
  })
  async getAllBooks(
    @GetUser() user: User,
    @Query("status") status?: BookStatus,
  ): Promise<Book[]> {
    if (status) {
      return this.bookService.findBooksByStatus(status, user.id);
    }
    return this.bookService.findAllBooks(user.id);
  }

  @Get("completed")
  @ApiOperation({ summary: "완독한 책 조회" })
  @ApiResponse({
    status: 200,
    description: "사용자가 완독한 책 목록",
    type: [Book],
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: Date,
    description: "시작 날짜",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: Date,
    description: "종료 날짜",
  })
  async getCompletedBooks(
    @GetUser() user: User,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ): Promise<Book[]> {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    return this.bookService.findCompletedBooks(user.id, start, end);
  }

  @Get(":id")
  @ApiOperation({ summary: "책 상세 정보 조회" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiResponse({
    status: 200,
    description: "책 상세 정보",
    type: Book,
  })
  async getBookById(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<Book> {
    return this.bookService.findBookById(id, user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "책 정보 수정" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiResponse({
    status: 200,
    description: "책이 성공적으로 수정되었습니다.",
    type: Book,
  })
  async updateBook(
    @Param("id") id: string,
    @Body() updateBookDto: UpdateBookDto,
    @GetUser() user: User,
  ): Promise<Book> {
    return this.bookService.updateBook(id, updateBookDto, user.id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "책 상태 업데이트" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiQuery({
    name: "status",
    required: true,
    enum: BookStatus,
    description: "변경할 책 상태",
  })
  @ApiResponse({
    status: 200,
    description: "책 상태가 성공적으로 업데이트되었습니다.",
    type: Book,
  })
  async updateBookStatus(
    @Param("id") id: string,
    @Query("status") status: BookStatus,
    @GetUser() user: User,
  ): Promise<Book> {
    return this.bookService.updateBookStatus(id, status, user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "책 삭제" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiResponse({
    status: 200,
    description: "책이 성공적으로 삭제되었습니다.",
  })
  async deleteBook(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<{ success: boolean }> {
    const result = await this.bookService.deleteBook(id, user.id);
    return { success: result };
  }
}
