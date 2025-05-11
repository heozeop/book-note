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
import { BookStatus } from "../entities/reading-status.entity";
import { BookService } from "../services/book.service";
import { TagService } from "../services/tag.service";

@ApiTags("books")
@Controller("books")
@UseGuards(JwtAuthGuard)
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly tagService: TagService,
  ) {}

  @ApiOperation({ summary: "새 책 등록" })
  @ApiResponse({
    status: 201,
    description: "책이 성공적으로 등록되었습니다.",
  })
  @Post()
  async createBook(
    @Body() createBookDto: CreateBookDto,
    @CurrentUser() user: User,
  ) {
    const userBook = await this.bookService.createBook(createBookDto, user);
    const tags = await this.bookService.getTagsForUserBook(userBook.id);
    return UserBookResponseDto.fromEntity(userBook, tags);
  }

  @ApiOperation({ summary: "ISBN으로 책 등록" })
  @ApiParam({ name: "isbn", description: "ISBN" })
  @ApiResponse({
    status: 201,
    description: "책이 성공적으로 등록되었습니다.",
  })
  @Post("isbn/:isbn")
  async createBookFromIsbn(
    @Param("isbn") isbn: string,
    @CurrentUser() user: User,
  ) {
    const userBook = await this.bookService.createBookFromIsbn(isbn, user);
    const tags = await this.bookService.getTagsForUserBook(userBook.id);
    return UserBookResponseDto.fromEntity(userBook, tags);
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
      const result = await this.bookService.searchBookByIsbn(isbn);
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

    return this.bookService.searchBooksByKeyword(query, {
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
  })
  @Get("search/local")
  async searchLocalBooks(
    @Query("query") query: string,
    @CurrentUser() user: User,
  ) {
    const books = await this.bookService.searchBooksByTitleQuery(query);
    
    // Convert to BookResponseDto for now until we implement proper UserBookResponseDto
    // handling for book search. This API might need further adjustment.
    return books.map(book => BookResponseDto.fromEntity(book));
  }

  @ApiOperation({ summary: "완독한 책 조회" })
  @ApiQuery({ name: "startDate", description: "시작 날짜 (ISO 형식)", required: true })
  @ApiQuery({ name: "endDate", description: "종료 날짜 (ISO 형식)", required: true })
  @ApiResponse({
    status: 200,
    description: "완독한 책 목록이 성공적으로 반환되었습니다.",
  })
  @Get("completed")
  async getCompletedBooks(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @CurrentUser() user: User,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // 종료일은 해당 일의 마지막 시간으로 설정 (23:59:59.999)
      end.setHours(23, 59, 59, 999);
      
      const books = await this.bookService.getCompletedBooks(user, start, end);
      
      // Get tags for each book
      const result: UserBookResponseDto[] = [];
      for (const userBook of books) {
        const tags = await this.bookService.getTagsForUserBook(userBook.id);
        const dto = UserBookResponseDto.fromEntity(userBook, tags);
        if (dto) {
          result.push(dto);
        }
      }
      
      return result;
    } catch (error) {
      throw new Error(`Invalid date format: ${error.message}`);
    }
  }

  /**
   * 특정 ID로 책을 조회합니다.
   */
  @Get(":id")
  @ApiOperation({ summary: "책 ID로 책 조회" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiResponse({ status: 200, description: "책 정보 반환" })
  async getBookById(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ) {
    const { userBook, tags } = await this.bookService.findBookByIdWithTags(id, user);
    return UserBookResponseDto.fromEntity(userBook, tags);
  }

  /**
   * 책을 수정합니다.
   */
  @Patch(":id")
  @ApiOperation({ summary: "책 정보 수정" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiResponse({ status: 200, description: "수정된 책 정보 반환" })
  async updateBook(
    @Param("id") id: string,
    @Body() updateBookDto: UpdateBookDto,
    @CurrentUser() user: User,
  ) {
    const userBook = await this.bookService.updateBook(id, updateBookDto, user);
    const tags = await this.bookService.getTagsForUserBook(userBook.id);
    return UserBookResponseDto.fromEntity(userBook, tags);
  }

  /**
   * 책 상태(읽는 중, 완료 등)를 업데이트합니다.
   */
  @Patch(":id/status")
  @ApiOperation({ summary: "책 읽기 상태 업데이트" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiQuery({ name: "status", enum: BookStatus, description: "책 상태 (WANT_TO_READ, READING, COMPLETED)" })
  @ApiResponse({ status: 200, description: "업데이트된 책 정보 반환" })
  async updateBookStatus(
    @Param("id") id: string,
    @Query("status") status: BookStatus,
    @CurrentUser() user: User,
  ) {
    // BookStatus enum에 포함된 값인지 유효성 검사
    if (!Object.values(BookStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    const userBook = await this.bookService.updateBookStatus(id, user, status);
    const tags = await this.bookService.getTagsForUserBook(userBook.id);
    return UserBookResponseDto.fromEntity(userBook, tags);
  }

  @ApiOperation({ summary: "모든 책 조회" })
  @ApiResponse({
    status: 200,
    description: "책 목록이 성공적으로 조회되었습니다.",
  })
  @ApiQuery({ name: "tag", description: "필터링할 태그", required: false })
  @Get()
  async getAllBooks(
    @CurrentUser() user: User,
    @Query("tag") tagName?: string
  ) {
    // If filtering by tag
    if (tagName) {
      // For tests, we need to handle createdBookId which is the book.id not the userBook.id
      // In e2e tests we're looking for createdBookId which is the book's ID, not the userBook's ID
      const userBooks = await this.tagService.findBooksByTag(tagName, user.id);
      
      // Get tags for each book
      const result: UserBookResponseDto[] = [];
      for (const userBook of userBooks) {
        const tags = await this.bookService.getTagsForUserBook(userBook.id);
        const dto = UserBookResponseDto.fromEntity(userBook, tags);
        if (dto) {
          // Optionally set additional properties for test compatibility
          result.push(dto);
        }
      }
      
      return result;
    }
    
    // Regular book listing
    const books = await this.bookService.findAllBooks(user);
    
    // Get tags for each book
    const result: UserBookResponseDto[] = [];
    for (const userBook of books) {
      const tags = await this.bookService.getTagsForUserBook(userBook.id);
      const dto = UserBookResponseDto.fromEntity(userBook, tags);
      if (dto) {
        result.push(dto);
      }
    }
    
    return result;
  }

  @ApiOperation({ summary: "책 삭제" })
  @ApiParam({ name: "id", description: "책 ID" })
  @ApiResponse({ status: 200, description: "삭제 성공 여부" })
  @Delete(":id")
  async deleteBook(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ) {
    await this.bookService.deleteBook(id, user);
    return { success: true };
  }
}
