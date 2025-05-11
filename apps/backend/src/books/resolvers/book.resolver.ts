import { Inject, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { BookResponseDto } from "../dtos/book.response.dto";
import { UserBookResponseDto } from "../dtos/user-book.response.dto";
import { BookStatus } from "../entities/reading-status.entity";
import { CreateBookInput } from "../graphql/inputs/create-book.input";
import { UpdateBookInput } from "../graphql/inputs/update-book.input";
import { BookResponseType } from "../graphql/types/book-response.type";
import { BookSearchResponseType } from "../graphql/types/book-search-response.type";
import { UserBookResponseType } from "../graphql/types/user-book-response.type";
import { BookSearchResponse, IBookSearchService } from "../modules/book-search/interfaces/book-search.interface";
import { BookService } from "../services/book.service";

@Resolver(() => UserBookResponseType)
@UseGuards(JwtAuthGuard)
export class BookResolver {
  constructor(
    private readonly bookService: BookService,
    @Inject('BOOK_SEARCH_SERVICE')
    private readonly bookSearchService: IBookSearchService
  ) {}

  @Query(() => [UserBookResponseType])
  async books(
    @CurrentUser() user: User,
    @Args('status', { nullable: true }) status?: BookStatus,
    @Args('tag', { nullable: true }) tag?: string
  ) {
    const books = await this.bookService.findAllBooks(user, status);
    
    // Get tags for each book
    const result: UserBookResponseType[] = [];
    for (const userBook of books) {
      const tags = await this.bookService.getTagsForUserBook(userBook.id);
      const dto = UserBookResponseDto.fromEntity(userBook, tags);
      if (dto) {
        result.push(UserBookResponseType.fromDto(dto));
      }
    }
    
    return result;
  }

  @Query(() => UserBookResponseType, { nullable: true })
  async book(
    @Args("id") id: string,
    @CurrentUser() user: User
  ) {
    const { userBook, tags } = await this.bookService.findBookByIdWithTags(id, user);
    const dto = UserBookResponseDto.fromEntity(userBook, tags);
    if (!dto) return null;
    return UserBookResponseType.fromDto(dto);
  }

  @Query(() => [BookResponseType])
  async searchLocalBooks(
    @Args("query") query: string,
    @CurrentUser() user: User
  ) {
    const books = await this.bookService.searchBooksByTitleQuery(query);
    
    // Return BookResponseType for search results as they may not be in the user's library
    return books
      .map(book => BookResponseDto.fromEntity(book))
      .filter(dto => dto !== null)
      .map(dto => BookResponseType.fromDto(dto));
  }

  @Query(() => BookSearchResponseType)
  async searchBooks(
    @Args("query", { nullable: true }) query?: string,
    @Args("isbn", { nullable: true }) isbn?: string,
    @Args("page", { type: () => Int, nullable: true }) page?: number,
    @Args("size", { type: () => Int, nullable: true }) size?: number,
    @Args("sort", { nullable: true }) sort?: string,
    @Args("order", { nullable: true }) order?: 'asc' | 'desc',
  ): Promise<BookSearchResponse> {
    if (isbn) {
      const result = await this.bookService.searchBookByIsbn(isbn);
      return {
        total: result ? 1 : 0,
        page: 1,
        start: 1,
        display: 1,
        items: result ? [result] : []
      };
    }

    if (!query) {
      return {
        total: 0,
        page: 1,
        start: 1,
        display: 0,
        items: []
      };
    }

    const display = size || 10;
    const start = page ? (page - 1) * display + 1 : 1;
    
    // Sort options mapping for the API
    let sortParam = sort || 'sim';
    if (sort === 'publishedDate') {
      sortParam = 'date';
    }

    return this.bookService.searchBooksByKeyword(query, {
      display,
      start,
      sort: sortParam,
      order
    });
  }

  @Mutation(() => UserBookResponseType, { nullable: true })
  async createBook(
    @Args('input') input: CreateBookInput,
    @CurrentUser() user: User
  ) {
    const userBook = await this.bookService.createBook(input, user);
    const tags = await this.bookService.getTagsForUserBook(userBook.id);
    const dto = UserBookResponseDto.fromEntity(userBook, tags);
    if (!dto) return null;
    return UserBookResponseType.fromDto(dto);
  }

  @Mutation(() => UserBookResponseType, { nullable: true })
  async updateBook(
    @Args("id") id: string, 
    @Args("input") input: UpdateBookInput,
    @CurrentUser() user: User
  ) {
    const userBook = await this.bookService.updateBook(id, input, user);
    const tags = await this.bookService.getTagsForUserBook(userBook.id);
    const dto = UserBookResponseDto.fromEntity(userBook, tags);
    if (!dto) return null;
    return UserBookResponseType.fromDto(dto);
  }

  @Mutation(() => UserBookResponseType, { nullable: true })
  async updateBookStatus(
    @Args("id") id: string,
    @Args("status") status: BookStatus,
    @CurrentUser() user: User
  ) {
    // Validate status is within BookStatus enum
    if (!Object.values(BookStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    const userBook = await this.bookService.updateBookStatus(id, user, status);
    const tags = await this.bookService.getTagsForUserBook(userBook.id);
    const dto = UserBookResponseDto.fromEntity(userBook, tags);
    if (!dto) return null;
    return UserBookResponseType.fromDto(dto);
  }

  @Mutation(() => Boolean)
  async deleteBook(
    @Args("id") id: string,
    @CurrentUser() user: User
  ) {
    return this.bookService.deleteBook(id, user);
  }
}
