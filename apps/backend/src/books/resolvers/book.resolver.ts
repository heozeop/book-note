import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { CreateBookInput, UpdateBookInput } from "../graphql/inputs";
import { BookResponseType, BookSearchResponseType, UserBookResponseType } from "../graphql/types";
import { BookStatus } from "../modules/book/entities/reading-status.entity";
import { BookFacadeService } from "../services/book-facade.service";

@Resolver(() => UserBookResponseType)
@UseGuards(JwtAuthGuard)
export class BookResolver {
  constructor(
    private readonly bookFacadeService: BookFacadeService
  ) {}

  @Query(() => [UserBookResponseType])
  async books(
    @CurrentUser() user: User,
    @Args('status', { nullable: true }) status?: BookStatus,
    @Args('tag', { nullable: true }) tag?: string
  ) {
    const userBooks = await this.bookFacadeService.findAllBooks(user, status);
    // If tag is provided, filter results by tag
    if (tag) {
      const booksWithTag = userBooks.filter(userBook => 
        userBook.tags.some(t => t.name.toLowerCase() === tag.toLowerCase())
      );
      return booksWithTag.map(dto => UserBookResponseType.fromDto(dto));
    }
    
    return userBooks.map(dto => UserBookResponseType.fromDto(dto));
  }

  @Query(() => UserBookResponseType, { nullable: true })
  async book(
    @Args("id") id: string,
    @CurrentUser() user: User
  ) {
    const userBook = await this.bookFacadeService.findBookById(id, user);
    return UserBookResponseType.fromDto(userBook);
  }

  @Query(() => [BookResponseType])
  async searchLocalBooks(
    @Args("query") query: string
  ) {
    const books = await this.bookFacadeService.searchBooksByTitleQuery(query);
    return books.map(dto => BookResponseType.fromDto(dto));
  }

  @Query(() => BookSearchResponseType)
  async searchBooks(
    @Args("query", { nullable: true }) query?: string,
    @Args("isbn", { nullable: true }) isbn?: string,
    @Args("page", { type: () => Int, nullable: true }) page?: number,
    @Args("size", { type: () => Int, nullable: true }) size?: number,
    @Args("sort", { nullable: true }) sort?: string,
    @Args("order", { nullable: true }) order?: 'asc' | 'desc',
  ) {
    // ISBN search takes priority
    if (isbn) {
      const result = await this.bookFacadeService.searchBookByIsbn(isbn);
      return {
        total: result ? 1 : 0,
        page: 1,
        start: 1,
        display: 1,
        items: result ? [result] : []
      };
    }

    // Return empty results if no query
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
    
    // Sort options
    const sortOption = sort || 'sim';  // Default to relevance

    return this.bookFacadeService.searchBooksByKeyword(query, {
      display,
      start,
      sort: sortOption,
      order
    });
  }

  @Mutation(() => UserBookResponseType)
  async createBook(
    @Args('input') input: CreateBookInput,
    @CurrentUser() user: User
  ) {
    const userBook = await this.bookFacadeService.createBook(input, user);
    return UserBookResponseType.fromDto(userBook);
  }

  @Mutation(() => UserBookResponseType)
  async updateBook(
    @Args("id") id: string, 
    @Args("input") input: UpdateBookInput,
    @CurrentUser() user: User
  ) {
    const userBook = await this.bookFacadeService.updateBook(id, input, user);
    return UserBookResponseType.fromDto(userBook);
  }

  @Mutation(() => UserBookResponseType)
  async updateBookStatus(
    @Args("id") id: string,
    @Args("status") status: BookStatus,
    @CurrentUser() user: User
  ) {
    // Validate status is within BookStatus enum
    if (!Object.values(BookStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    const userBook = await this.bookFacadeService.updateBookStatus(id, status, user);
    return UserBookResponseType.fromDto(userBook);
  }

  @Mutation(() => Boolean)
  async deleteBook(
    @Args("id") id: string,
    @CurrentUser() user: User
  ) {
    return this.bookFacadeService.deleteBook(id, user);
  }
}
