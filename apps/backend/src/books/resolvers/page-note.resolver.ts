import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PageNoteFacadeService } from "../services/page-note-facade.service";
import { PageNoteType } from "../graphql/types/page-note.type";
import { CreatePageNoteInput } from "../graphql/inputs/create-page-note.input";

@Resolver(() => PageNoteType)
@UseGuards(JwtAuthGuard)
export class PageNoteResolver {
  constructor(private readonly pageNoteFacadeService: PageNoteFacadeService) {}

  @Query(() => [PageNoteType])
  async pageNotes(@Args('userBookId') userBookId: string) {
    const pageNotes = await this.pageNoteFacadeService.findPageNotesByUserBookId(userBookId);
    return pageNotes.map(note => PageNoteType.fromDto(note));
  }

  @Query(() => PageNoteType, { nullable: true })
  async pageNote(
    @Args('id') id: string,
    @Args('userBookId') userBookId: string
  ) {
    try {
      const pageNote = await this.pageNoteFacadeService.findPageNoteById(id, userBookId);
      if (!pageNote) {
        return null;
      }

      return PageNoteType.fromDto(pageNote);
    } catch (error) {
      return null; // Return null for GraphQL if note is not found
    }
  }

  @Mutation(() => PageNoteType)
  async createPageNote(
    @Args('input') createPageNoteInput: CreatePageNoteInput,
    @CurrentUser() user: User
  ) {
    // Map GraphQL input to DTO
    const createDto = {
      page: createPageNoteInput.page,
      content: createPageNoteInput.content,
      userBookId: createPageNoteInput.userBookId
    };
    
    const pageNote = await this.pageNoteFacadeService.createPageNote(createDto, user);
    return PageNoteType.fromDto(pageNote);
  }

  @Mutation(() => Boolean)
  async deletePageNote(
    @Args('id') id: string,
    @Args('userBookId') userBookId: string
  ) {
    return this.pageNoteFacadeService.deletePageNote(id, userBookId);
  }
} 