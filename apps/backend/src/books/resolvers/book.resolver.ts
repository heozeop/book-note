import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { Book, BookStatus } from "../entities/book.entity";
import { CreateBookInput } from "../graphql/inputs/create-book.input";
import { UpdateBookInput } from "../graphql/inputs/update-book.input";
import { BookType } from "../graphql/types/book.type";
import { BookService } from "../services/book.service";

@Resolver(() => BookType)
@UseGuards(JwtAuthGuard)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => [BookType], { name: "books" })
  async getBooks(
    @CurrentUser() user: User,
    @Args("status", { nullable: true }) status?: BookStatus,
  ): Promise<BookType[]> {
    let books: Book[];

    if (status) {
      books = await this.bookService.findBooksByStatus(status, user.id);
    } else {
      books = await this.bookService.findAllBooks(user.id);
    }

    return books.map((book) => this.mapBookToType(book));
  }

  @Query(() => BookType, { name: "book" })
  async getBook(
    @Args("id") id: string,
    @CurrentUser() user: User,
  ): Promise<BookType> {
    const book = await this.bookService.findBookById(id, user.id);
    return this.mapBookToType(book);
  }

  @Mutation(() => BookType)
  async createBook(
    @Args("input") createBookInput: CreateBookInput,
    @CurrentUser() user: User,
  ): Promise<BookType> {
    const book = await this.bookService.createBook(createBookInput, user);
    return this.mapBookToType(book);
  }

  @Mutation(() => BookType)
  async updateBook(
    @Args("id") id: string,
    @Args("input") updateBookInput: UpdateBookInput,
    @CurrentUser() user: User,
  ): Promise<BookType> {
    const book = await this.bookService.updateBook(
      id,
      updateBookInput,
      user.id,
    );
    return this.mapBookToType(book);
  }

  @Mutation(() => Boolean)
  async deleteBook(
    @Args("id") id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.bookService.deleteBook(id, user.id);
  }

  @Mutation(() => BookType)
  async updateBookStatus(
    @Args("id") id: string,
    @Args("status") status: string,
    @CurrentUser() user: User,
  ): Promise<BookType> {
    // Convert GraphQL enum string to BookStatus enum
    let bookStatus: BookStatus;
    
    // Map from uppercase GraphQL enum to lowercase database enum
    switch(status.toUpperCase()) {
      case 'WANT_TO_READ':
        bookStatus = BookStatus.WANT_TO_READ;
        break;
      case 'READING':
        bookStatus = BookStatus.READING;
        break;
      case 'COMPLETED':
        bookStatus = BookStatus.COMPLETED;
        break;
      case 'DNF':
        bookStatus = BookStatus.DNF;
        break;
      default:
        bookStatus = BookStatus.WANT_TO_READ;
    }
    
    const book = await this.bookService.updateBookStatus(id, bookStatus, user.id);
    return this.mapBookToType(book);
  }

  /**
   * Maps a Book entity to a BookType for GraphQL
   */
  private mapBookToType(book: Book): BookType {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      coverImage: book.coverImage,
      description: book.description,
      publishedDate: book.publishedDate,
      publisher: book.publisher,
      status: book.status,
      currentPage: book.currentPage,
      totalPages: book.totalPages,
      startedAt: book.startedAt,
      finishedAt: book.finishedAt,
      metadata: book.metadata && JSON.stringify(book.metadata),
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      owner: { id: book.owner.id } as any, // Will be resolved by UserResolver if needed
      notes: book.notes?.isInitialized() ? book.notes.getItems().map((note) => ({ id: note.id })) as any : [] as any,
    };
  }
}
