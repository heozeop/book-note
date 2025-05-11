import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../auth/entities/user.entity";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { NoteResponseDto } from "../dtos/note.response.dto";
import { CreateNoteInput } from "../graphql/inputs/create-note.input";
import { UpdateNoteInput } from "../graphql/inputs/update-note.input";
import { NoteResponseType } from "../graphql/types/note-response.type";
import { NoteService } from "../services/note.service";

@Resolver(() => NoteResponseType)
@UseGuards(JwtAuthGuard)
export class NoteResolver {
  constructor(private readonly noteService: NoteService) {}

  @Query(() => [NoteResponseType])
  async bookNotes(
    @Args('bookId') bookId: string,
    @CurrentUser() user: User
  ) {
    const notes = await this.noteService.findNotesByBookId(bookId, user.id);
    return notes
      .map(note => NoteResponseDto.fromEntity(note))
      .filter(dto => dto !== null)
      .map(dto => NoteResponseType.fromDto(dto));
  }

  @Query(() => NoteResponseType, { nullable: true })
  async note(
    @Args('id') id: string,
    @CurrentUser() user: User
  ) {
    const note = await this.noteService.findNoteById(id, user.id);
    const dto = NoteResponseDto.fromEntity(note);
    if (!dto) return null;
    return NoteResponseType.fromDto(dto);
  }

  @Query(() => [NoteResponseType])
  async publicNotes(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number
  ) {
    const notes = await this.noteService.findPublicNotes({ limit, offset });
    return notes
      .map(note => NoteResponseDto.fromEntity(note))
      .filter(dto => dto !== null)
      .map(dto => NoteResponseType.fromDto(dto));
  }

  @Mutation(() => NoteResponseType)
  async createNote(
    @Args('bookId') bookId: string,
    @Args('input') input: CreateNoteInput,
    @CurrentUser() user: User
  ) {
    const note = await this.noteService.createNote(bookId, input, user);
    const dto = NoteResponseDto.fromEntity(note);
    if (!dto) return null;
    return NoteResponseType.fromDto(dto);
  }

  @Mutation(() => NoteResponseType, { nullable: true })
  async updateNote(
    @Args('id') id: string,
    @Args('input') input: UpdateNoteInput,
    @CurrentUser() user: User
  ) {
    const note = await this.noteService.updateNote(id, input, user.id);
    const dto = NoteResponseDto.fromEntity(note);
    if (!dto) return null;
    return NoteResponseType.fromDto(dto);
  }

  @Mutation(() => Boolean)
  async deleteNote(
    @Args('id') id: string,
    @CurrentUser() user: User
  ) {
    await this.noteService.deleteNote(id, user.id);
    return true;
  }
} 