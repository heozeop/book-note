import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { BookResponseDto } from "../dtos/book.response.dto";
import { CreateCollectionInput } from "../graphql/inputs/create-collection.input";
import { UpdateCollectionInput } from "../graphql/inputs/update-collection.input";
import { BookResponseType } from "../graphql/types/book-response.type";
import { CollectionResponseType } from "../graphql/types/collection-response.type";
import { BookService } from "../services/book.service";
import { CollectionService } from "../services/collection.service";

@Resolver(() => CollectionResponseType)
@UseGuards(JwtAuthGuard)
export class CollectionResolver {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly bookService: BookService,
  ) {}

  @Query(() => [CollectionResponseType])
  async collections(@CurrentUser() user: User) {
    const collections = await this.collectionService.findAllByUserId(user.id);
    return collections.map(collection => CollectionResponseType.fromEntity(collection));
  }

  @Query(() => CollectionResponseType, { nullable: true })
  async collection(
    @Args("id") id: string,
    @CurrentUser() user: User
  ) {
    const collection = await this.collectionService.findById(id, user.id);
    if (!collection) return null;
    return CollectionResponseType.fromEntity(collection);
  }

  @Mutation(() => CollectionResponseType)
  async createCollection(
    @Args("input") input: CreateCollectionInput,
    @CurrentUser() user: User
  ) {
    const collection = await this.collectionService.createCollection(input, user);
    return CollectionResponseType.fromEntity(collection);
  }

  @Mutation(() => CollectionResponseType, { nullable: true })
  async updateCollection(
    @Args("id") id: string,
    @Args("input") input: UpdateCollectionInput,
    @CurrentUser() user: User
  ) {
    const collection = await this.collectionService.updateCollection(id, input, user.id);
    if (!collection) return null;
    return CollectionResponseType.fromEntity(collection);
  }

  @Mutation(() => Boolean)
  async deleteCollection(
    @Args("id") id: string,
    @CurrentUser() user: User
  ) {
    await this.collectionService.deleteCollection(id, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  async addBookToCollection(
    @Args("collectionId") collectionId: string,
    @Args("bookId") bookId: string,
    @CurrentUser() user: User
  ) {
    await this.collectionService.addBookToCollection(collectionId, bookId, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  async removeBookFromCollection(
    @Args("collectionId") collectionId: string,
    @Args("bookId") bookId: string,
    @CurrentUser() user: User
  ) {
    await this.collectionService.removeBookFromCollection(collectionId, bookId, user.id);
    return true;
  }

  @Query(() => [BookResponseType])
  async collectionBooks(
    @Args("collectionId") collectionId: string,
    @CurrentUser() user: User
  ) {
    const books = await this.collectionService.getBooksFromCollection(collectionId, user.id);
    
    // Collections contain BookResponseDto objects, not UserBookResponseDto
    return books
      .map(bookDto => BookResponseDto.fromCollectionBook(bookDto))
      .filter(dto => dto !== null)
      .map(dto => BookResponseType.fromDto(dto));
  }
} 