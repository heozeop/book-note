import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NoteResponseDto } from '../../dtos/note.response.dto';

@ObjectType()
class BookReference {
  @Field(() => ID)
  id: string;
}

@ObjectType()
export class NoteResponseType {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  page?: number;

  @Field()
  isPublic: boolean;

  @Field(() => BookReference)
  book: BookReference;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  /**
   * Convert from DTO to GraphQL type
   */
  static fromDto(dto: NoteResponseDto): NoteResponseType {
    if (!dto) {
      return null;
    }
    
    const type = new NoteResponseType();
    type.id = dto.id;
    type.content = dto.content;
    type.title = dto.title;
    type.page = dto.page;
    type.isPublic = dto.isPublic;
    type.book = { id: dto.book?.id };
    type.createdAt = dto.createdAt;
    type.updatedAt = dto.updatedAt;
    
    return type;
  }
} 