import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../auth/entities/user.entity';
import { CreatePageNoteDto } from '../dtos/create-page-note.dto';
import { PageNoteResponseDto } from '../dtos/page-note.response.dto';
import { UpdatePageNoteDto } from '../dtos/update-page-note.dto';
import { PageNoteService } from '../modules/notes/services/page-note.service';

@Injectable()
export class PageNoteFacadeService {
  constructor(
    private readonly pageNoteService: PageNoteService
  ) {}

  /**
   * Find all page notes for a user book
   */
  async findPageNotesByUserBookId(userBookId: string): Promise<PageNoteResponseDto[]> {
    const pageNotes = await this.pageNoteService.findAllByUserBookId(userBookId);

    return pageNotes.map(note => PageNoteResponseDto.fromEntity(note));
  }

  /**
   * Find page note by ID
   */
  async findPageNoteById(id: string, userBookId: string): Promise<PageNoteResponseDto | null> {
    const pageNote = await this.pageNoteService.findById(id, userBookId);
    if (!pageNote) {
      throw new NotFoundException(`Page note with ID ${id} not found`);
    }
    return PageNoteResponseDto.fromEntity(pageNote);
  }

  /**
   * Create a new page note
   */
  async createPageNote(createPageNoteDto: CreatePageNoteDto, user: User): Promise<PageNoteResponseDto> {
    // First validate that the user has access to the userBook
    await this.validateUserBookAccess(createPageNoteDto.userBookId, user.id);
    
    const pageNote = await this.pageNoteService.create(createPageNoteDto, user.id);
    return PageNoteResponseDto.fromEntity(pageNote);
  }

  /**
   * Update an existing page note
   */
  async updatePageNote(
    id: string, 
    updatePageNoteDto: UpdatePageNoteDto, 
    userBookId: string
  ): Promise<PageNoteResponseDto> {
    const pageNote = await this.pageNoteService.update(id, updatePageNoteDto, userBookId);
    if (!pageNote) {
      throw new NotFoundException(`Page note with ID ${id} not found`);
    }
    return PageNoteResponseDto.fromEntity(pageNote);
  }

  /**
   * Delete a page note
   */
  async deletePageNote(id: string, userBookId: string): Promise<boolean> {
    return this.pageNoteService.delete(id, userBookId);
  }

  /**
   * Helper method to validate user has access to the userBook
   */
  private async validateUserBookAccess(userBookId: string, userId: string): Promise<void> {
    const hasAccess = await this.pageNoteService.validateUserBookAccess(userBookId, userId);
    if (!hasAccess) {
      throw new NotFoundException(`UserBook with ID ${userBookId} not found or you don't have access`);
    }
  }
} 