import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { CreateCollectionInput, UpdateCollectionInput } from "../graphql/inputs";
import { BookResponseType, CollectionResponseType } from "../graphql/types";
import { CollectionFacadeService } from "../services/collection-facade.service";

@Resolver(() => CollectionResponseType)
@UseGuards(JwtAuthGuard)
export class CollectionResolver {
  constructor(
    private readonly collectionFacadeService: CollectionFacadeService,
  ) {}

  @Query(() => [CollectionResponseType])
  async collections(@CurrentUser() user: User) {
    const collections = await this.collectionFacadeService.findAllByUserId(user.id);
    return collections.map(collection => CollectionResponseType.fromDto(collection));
  }

  @Query(() => CollectionResponseType, { nullable: true })
  async collection(
    @Args("id") id: string,
    @CurrentUser() user: User
  ) {
    const collection = await this.collectionFacadeService.findById(id, user.id);
    return CollectionResponseType.fromDto(collection);
  }

  @Mutation(() => CollectionResponseType)
  async createCollection(
    @Args("input") input: CreateCollectionInput,
    @CurrentUser() user: User
  ) {
    const collection = await this.collectionFacadeService.createCollection(input, user);
    return CollectionResponseType.fromDto(collection);
  }

  @Mutation(() => CollectionResponseType)
  async updateCollection(
    @Args("id") id: string,
    @Args("input") input: UpdateCollectionInput,
    @CurrentUser() user: User
  ) {
    const collection = await this.collectionFacadeService.updateCollection(id, input, user.id);
    return CollectionResponseType.fromDto(collection);
  }

  @Mutation(() => Boolean)
  async deleteCollection(
    @Args("id") id: string,
    @CurrentUser() user: User
  ) {
    return this.collectionFacadeService.deleteCollection(id, user.id);
  }

  @Mutation(() => Boolean)
  async addBookToCollection(
    @Args("collectionId") collectionId: string,
    @Args("bookId") bookId: string,
    @CurrentUser() user: User
  ) {
    await this.collectionFacadeService.addBookToCollection(collectionId, bookId, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  async removeBookFromCollection(
    @Args("collectionId") collectionId: string,
    @Args("bookId") bookId: string,
    @CurrentUser() user: User
  ) {
    await this.collectionFacadeService.removeBookFromCollection(collectionId, bookId, user.id);
    return true;
  }

  @Query(() => [BookResponseType])
  async collectionBooks(
    @Args("collectionId") collectionId: string,
    @CurrentUser() user: User
  ) {
    const books = await this.collectionFacadeService.getBooksFromCollection(collectionId, user.id);
    return books.map(book => BookResponseType.fromDto(book));
  }
} 