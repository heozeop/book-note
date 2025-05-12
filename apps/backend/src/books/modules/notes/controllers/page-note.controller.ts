import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../../../auth/decorators/current-user.decorator";
import { User } from "../../../../auth/entities/user.entity";
import { JwtAuthGuard } from "../../../../auth/guards/jwt.guard";
import { CreatePageNoteDto } from "../../../dtos/page-note.dto";
import { PageNoteService } from "../services/page-note.service";

@Controller('page-notes')
@UseGuards(JwtAuthGuard)
export class PageNoteController {
  constructor(private readonly pageNoteService: PageNoteService) {}

  @Get('user-book/:userBookId')
  async findPageNotesByUserBookId(@Param('userBookId') userBookId: string) {
    return this.pageNoteService.findPageNotesByUserBookId(userBookId);
  }

  @Get(':id/user-book/:userBookId')
  async findPageNoteById(@Param('id') id: string, @Param('userBookId') userBookId: string) {
    return this.pageNoteService.findPageNoteById(id, userBookId);
  }

  @Post()
  async createPageNote(
    @Body() createPageNoteDto: CreatePageNoteDto,
    @CurrentUser() user: User
  ) {
    return this.pageNoteService.createPageNote(createPageNoteDto, user);
  }

  @Delete(':id/user-book/:userBookId')
  async deletePageNote(@Param('id') id: string, @Param('userBookId') userBookId: string) {
    return this.pageNoteService.deletePageNote(id, userBookId);
  }
} 