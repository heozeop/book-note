import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/auth/entities/user.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreatePageNoteInput, UpdatePageNoteInput } from '../../../graphql/inputs';
import { PageNoteType } from '../../../graphql/types/page-note.type';
import { PageNoteService } from '../services/page-note.service';

@Resolver(() => PageNoteType)
export class PageNoteResolver {
  constructor(private readonly pageNoteService: PageNoteService) {}

  @Query(() => [PageNoteType])
  @UseGuards(JwtAuthGuard)
  async pageNotesByUserBook(
    @Args('userBookId', { type: () => ID }) userBookId: string,
    @CurrentUser() user: User
  ): Promise<PageNoteType[]> {
    const pageNotes = await this.pageNoteService.findAllByUserBookId(userBookId);
    return pageNotes.map(note => PageNoteType.fromDto(note));
  }

  @Query(() => PageNoteType, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async pageNote(
    @Args('id', { type: () => ID }) id: string,
    @Args('userBookId', { type: () => ID }) userBookId: string,
    @CurrentUser() user: User
  ): Promise<PageNoteType | null> {
    const pageNote = await this.pageNoteService.findById(id, userBookId);
    return pageNote ? PageNoteType.fromDto(pageNote) : null;
  }

  @Mutation(() => PageNoteType)
  @UseGuards(JwtAuthGuard)
  async createPageNote(
    @Args('input') input: CreatePageNoteInput,
    @CurrentUser() user: User
  ): Promise<PageNoteType> {
    const pageNote = await this.pageNoteService.create(input, user.id);
    return PageNoteType.fromDto(pageNote);
  }

  @Mutation(() => PageNoteType, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async updatePageNote(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePageNoteInput,
    @Args('userBookId', { type: () => ID }) userBookId: string,
    @CurrentUser() user: User
  ): Promise<PageNoteType | null> {
    const pageNote = await this.pageNoteService.update(id, input, userBookId);
    return pageNote ? PageNoteType.fromDto(pageNote) : null;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deletePageNote(
    @Args('id', { type: () => ID }) id: string,
    @Args('userBookId', { type: () => ID }) userBookId: string,
    @CurrentUser() user: User
  ): Promise<boolean> {
    return this.pageNoteService.delete(id, userBookId);
  }
} 