import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { BookResponseDto } from "../dtos/book.response.dto";
import { CreateBookDto } from "../dtos/create-book.dto";
import { UpdateBookDto } from "../dtos/update-book.dto";
import { UserBookResponseDto } from "../dtos/user-book.response.dto";
import { BookStatus } from "../modules/book/entities/reading-status.entity";
import { BookFacadeService } from "../services/book-facade.service";

@ApiTags("books")
@Controller("books")
@UseGuards(JwtAuthGuard)
export class BookController {
  constructor(
    private readonly bookFacadeService: BookFacadeService,
  ) {}

  @ApiOperation({ summary: "새 책 등록" })
  @ApiResponse({
    status: 201,
    description: "책이 성공적으로 등록되었습니다.",
    type: UserBookResponseDto,
  })
  @Post()
  async createBook(
    @Body() createBookDto: CreateBookDto,
    @CurrentUser() user: User,
  ): Promise<UserBookResponseDto> {
    return this.bookFacadeService.createBook(createBookDto, user);
  }

  @ApiOperation({ summary: "ISBN으로 책 등록" })
  @ApiParam({ name: "isbn", description: "ISBN" })
  @ApiResponse({
    status: 201,
    description: "책이 성공적으로 등록되었습니다.",
    type: UserBookResponseDto,
  })
  @Post("isbn/:isbn")
  async createBookFromIsbn(
    @Param("isbn") isbn: string,
    @CurrentUser() user: User,
  ): Promise<UserBookResponseDto> {
    return this.bookFacadeService.createBookFromIsbn(isbn, user);
  }

  @ApiOperation({ summary: "책 검색 (키워드 또는 ISBN)" })
  @ApiQuery({ name: "query", description: "검색 키워드", required: false })
  @ApiQuery({ name: "isbn", description: "ISBN 코드", required: false })
  @ApiQuery({ name: "page", description: "페이지 번호", required: false })
  @ApiQuery({ name: "size", description: "페이지 크기", required: false })
  @ApiQuery({ name: "sort", description: "정렬 기준 (publishedDate, relevance)", required: false })
  @ApiQuery({ name: "order", description: "정렬 방향 (asc, desc)", required: false })
  @ApiResponse({
    status: 200,
    description: "검색 결과가 성공적으로 반환되었습니다.",
  })
  @Get("search")
  async searchBooks(
    @Query("query") query?: string,
    @Query("isbn") isbn?: string,
    @Query("page") page?: number,
    @Query("size") size?: number,
    @Query("sort") sort?: string,
    @Query("order") order?: 'asc' | 'desc',
  ) {
    // ISBN 검색이 우선
    if (isbn) {
      const result = await this.bookFacadeService.searchBookByIsbn(isbn);
      // 동일한 응답 형식 유지
      return {
        total: result ? 1 : 0,
        page: 1,
        items: result ? [result] : []
      };
    }

    // 검색어가 없으면 빈 결과 반환
    if (!query) {
      return {
        total: 0,
        page: 1,
        items: []
      };
    }

    const display = size || 10;
    const start = page ? (page - 1) * display + 1 : 1;
    
    // 정렬 옵션 처리
    const sortOption = sort || 'sim';  // 기본값은 관련성

    return this.bookFacadeService.searchBooksByKeyword(query, {
      display,
      start,
      sort: sortOption,
      order
    });
  }

  @ApiOperation({ summary: "제목으로 책 검색 (로컬 DB)" })
  @ApiQuery({ name: "query", description: "제목 검색어" })
  @ApiResponse({
    status: 200,
    description: "검색 결과가 성공적으로 반환되었습니다.",
    type: [BookResponseDto],
  })
  @Get("search/local")
  async searchLocalBooks(
    @Query("query") query: string,
  ): Promise<BookResponseDto[]> {
    return this.bookFacadeService.searchBooksByTitleQuery(query);
  }

  @ApiOperation({ summary: "완독한 책 조회" })
  @ApiQuery({ name: "startDate", description: "시작 날짜 (ISO 형식)", required: true })
  @ApiQuery({ name: "endDate", description: "종료 날짜 (ISO 형식)", required: true })
  @ApiResponse({
    status: 200,
    description: "완독한 책 목록이 성공적으로 반환되었습니다.",
    type: [UserBookResponseDto],
  })
  @Get("completed")
  async getCompletedBooks(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @CurrentUser() user: User,
  ): Promise<UserBookResponseDto[]> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // 종료일은 해당 일의 마지막 시간으로 설정 (23:59:59.999)
      end.setHours(23, 59, 59, 999);
      
      return this.bookFacadeService.getCompletedBooks(user, start, end);
    } catch (error) {
      throw new Error(`Invalid date format: ${error.message}`);
    }
  }

  @ApiOperation({ summary: "책 ID로 책 조회" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiResponse({ 
    status: 200, 
    description: "책 정보 반환",
    type: UserBookResponseDto,
  })
  @Get(":id")
  async getBookById(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<UserBookResponseDto> {
    return this.bookFacadeService.findBookById(id, user);
  }

  @ApiOperation({ summary: "책 정보 수정" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiResponse({ 
    status: 200, 
    description: "수정된 책 정보 반환",
    type: UserBookResponseDto,
  })
  @Patch(":id")
  async updateBook(
    @Param("id") id: string,
    @Body() updateBookDto: UpdateBookDto,
    @CurrentUser() user: User,
  ): Promise<UserBookResponseDto> {
    return this.bookFacadeService.updateBook(id, updateBookDto, user);
  }

  @ApiOperation({ summary: "책 읽기 상태 업데이트" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiQuery({ name: "status", enum: BookStatus, description: "책 상태 (WANT_TO_READ, READING, COMPLETED)" })
  @ApiResponse({ 
    status: 200, 
    description: "업데이트된 책 정보 반환",
    type: UserBookResponseDto,
  })
  @Patch(":id/status")
  async updateBookStatus(
    @Param("id") id: string,
    @Query("status") status: BookStatus,
    @CurrentUser() user: User,
  ): Promise<UserBookResponseDto> {
    // BookStatus enum에 포함된 값인지 유효성 검사
    if (!Object.values(BookStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    return this.bookFacadeService.updateBookStatus(id, status, user);
  }

  @ApiOperation({ summary: "모든 책 조회" })
  @ApiResponse({
    status: 200,
    description: "책 목록이 성공적으로 조회되었습니다.",
    type: [UserBookResponseDto],
  })
  @ApiQuery({ name: "status", description: "필터링할 상태", required: false, enum: BookStatus })
  @Get()
  async getAllBooks(
    @CurrentUser() user: User,
    @Query("status") status?: BookStatus,
  ): Promise<UserBookResponseDto[]> {
    return this.bookFacadeService.findAllBooks(user, status);
  }

  @ApiOperation({ summary: "책 삭제" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiResponse({
    status: 200,
    description: "책이 성공적으로 삭제되었습니다.",
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
  async deleteBook(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    const result = await this.bookFacadeService.deleteBook(id, user);
    return { success: result };
  }
}
