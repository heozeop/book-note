import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { GqlAuthGuard } from "../../auth/guards/gql-auth.guard";
import { Book, BookStatus } from "../entities/book.entity";
import { CreateBookInput } from "../inputs/create-book.input";
import { UpdateBookInput } from "../inputs/update-book.input";
import { BookService } from "../services/book.service";

@Resolver(() => Book)
@UseGuards(GqlAuthGuard)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => [Book], { name: "books" })
  async getBooks(
    @CurrentUser() user: User,
    @Args("status", { nullable: true }) status?: BookStatus,
  ): Promise<Book[]> {
    if (status) {
      return this.bookService.findBooksByStatus(status, user.id);
    }
    return this.bookService.findAllBooks(user.id);
  }

  @Query(() => Book, { name: "book" })
  async getBook(
    @Args("id") id: string,
    @CurrentUser() user: User,
  ): Promise<Book> {
    return this.bookService.findBookById(id, user.id);
  }

  @Mutation(() => Book)
  async createBook(
    @Args("input") createBookInput: CreateBookInput,
    @CurrentUser() user: User,
  ): Promise<Book> {
    return this.bookService.createBook(createBookInput, user);
  }

  @Mutation(() => Book)
  async updateBook(
    @Args("id") id: string,
    @Args("input") updateBookInput: UpdateBookInput,
    @CurrentUser() user: User,
  ): Promise<Book> {
    return this.bookService.updateBook(id, updateBookInput, user.id);
  }

  @Mutation(() => Boolean)
  async deleteBook(
    @Args("id") id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.bookService.deleteBook(id, user.id);
  }

  @Mutation(() => Book)
  async updateBookStatus(
    @Args("id") id: string,
    @Args("status") status: BookStatus,
    @CurrentUser() user: User,
  ): Promise<Book> {
    return this.bookService.updateBookStatus(id, status, user.id);
  }
}
