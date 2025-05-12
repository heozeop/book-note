import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PageNoteResponseDto } from '../../dtos/page-note.response.dto';
import { PageNote } from '../../modules/notes/entities/page-note.entity';

@ObjectType()
export class PageNoteType {
  @Field(() => ID)
  id: string;

  @Field()
  page: number;

  @Field()
  content: string;

  @Field()
  userBookId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  static fromEntity(pageNote: PageNote): PageNoteType {
    const type = new PageNoteType();
    type.id = pageNote.id;
    type.page = pageNote.page || 0;
    type.content = pageNote.title || '';
    type.userBookId = pageNote.userBook.id;
    type.createdAt = pageNote.createdAt;
    type.updatedAt = pageNote.updatedAt;
    return type;
  }

  static fromDto(dto: PageNoteResponseDto): PageNoteType {
    const type = new PageNoteType();
    type.id = dto.id;
    type.page = dto.page;
    type.content = dto.content;
    type.userBookId = dto.userBookId;
    type.createdAt = dto.createdAt;
    type.updatedAt = dto.updatedAt;
    return type;
  }
} 