import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
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
import { CreateNoteDto } from "../dtos/create-note.dto";
import { NoteResponseDto } from "../dtos/note.response.dto";
import { NoteService } from "../services/note.service";

@ApiTags("notes")
@Controller("books/:bookId/notes")
@UseGuards(JwtAuthGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @ApiOperation({ summary: "노트 생성" })
  @ApiParam({ name: "bookId", description: "책 ID" })
  @ApiResponse({
    status: 201,
    description: "노트가 성공적으로 생성되었습니다.",
  })
  @Post()
  async createNote(
    @Param("bookId") bookId: string,
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() user: User
  ) {
    const note = await this.noteService.createNote(bookId, createNoteDto, user);
    return NoteResponseDto.fromEntity(note);
  }

  @ApiOperation({ summary: "노트 목록 조회" })
  @ApiParam({ name: "bookId", description: "책 ID" })
  @ApiResponse({
    status: 200,
    description: "노트 목록이 성공적으로 반환되었습니다.",
  })
  @Get()
  async getNotes(
    @Param("bookId") bookId: string,
    @CurrentUser() user: User
  ) {
    const notes = await this.noteService.findNotesByBookId(bookId, user.id);
    return notes.map(note => NoteResponseDto.fromEntity(note));
  }

  @ApiOperation({ summary: "노트 상세 조회" })
  @ApiParam({ name: "bookId", description: "책 ID" })
  @ApiParam({ name: "noteId", description: "노트 ID" })
  @ApiResponse({
    status: 200,
    description: "노트가 성공적으로 반환되었습니다.",
  })
  @Get(":noteId")
  async getNote(
    @Param("bookId") bookId: string,
    @Param("noteId") noteId: string,
    @CurrentUser() user: User
  ) {
    const note = await this.noteService.findNoteById(noteId, user.id);
    return NoteResponseDto.fromEntity(note);
  }

  @ApiOperation({ summary: "노트 수정" })
  @ApiParam({ name: "bookId", description: "책 ID" })
  @ApiParam({ name: "noteId", description: "노트 ID" })
  @ApiResponse({
    status: 200,
    description: "노트가 성공적으로 수정되었습니다.",
  })
  @Patch(":noteId")
  async updateNote(
    @Param("bookId") bookId: string,
    @Param("noteId") noteId: string,
    @Body() updateData: Partial<CreateNoteDto>,
    @CurrentUser() user: User
  ) {
    const note = await this.noteService.updateNote(noteId, updateData, user.id);
    return NoteResponseDto.fromEntity(note);
  }

  @ApiOperation({ summary: "노트 삭제" })
  @ApiParam({ name: "bookId", description: "책 ID" })
  @ApiParam({ name: "noteId", description: "노트 ID" })
  @ApiResponse({
    status: 200,
    description: "노트가 성공적으로 삭제되었습니다.",
  })
  @Delete(":noteId")
  async deleteNote(
    @Param("bookId") bookId: string,
    @Param("noteId") noteId: string,
    @CurrentUser() user: User
  ) {
    await this.noteService.deleteNote(noteId, user.id);
    return { success: true };
  }

  @ApiOperation({ summary: "공개 노트 조회" })
  @ApiQuery({ name: "limit", description: "조회할 노트 수", required: false })
  @ApiQuery({ name: "offset", description: "건너뛸 노트 수", required: false })
  @ApiResponse({
    status: 200,
    description: "공개 노트 목록이 성공적으로 반환되었습니다.",
  })
  @Get("public")
  async getPublicNotes(
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    const notes = await this.noteService.findPublicNotes({ limit, offset });
    return notes.map(note => NoteResponseDto.fromEntity(note));
  }
} 