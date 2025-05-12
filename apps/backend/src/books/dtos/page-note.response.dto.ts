import { PageNote } from "../modules/notes/entities/page-note.entity";

export class PageNoteResponseDto {
  id: string;
  page: number;
  content: string;
  userBookId: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(pageNote: PageNote): PageNoteResponseDto {
    const dto = new PageNoteResponseDto();
    dto.id = pageNote.id;
    dto.page = pageNote.page || 0;
    dto.content = pageNote.title || '';
    dto.userBookId = pageNote.userBook.id;
    dto.createdAt = pageNote.createdAt;
    dto.updatedAt = pageNote.updatedAt;
    
    return dto;
  }
} 