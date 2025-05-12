import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserBookResponseDto } from '../../dtos/user-book.response.dto';
import { BookResponseType } from './book-response.type';
import { TagResponseType } from './tag-response.type';

@ObjectType()
export class UserBookResponseType {
  @Field(() => ID)
  id: string;

  @Field(() => BookResponseType)
  book: BookResponseType;

  @Field()
  status: string;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  finishedAt?: Date;

  @Field(() => [TagResponseType], { nullable: true })
  tags?: TagResponseType[];
  
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  static fromDto(dto: UserBookResponseDto): UserBookResponseType {
    const type = new UserBookResponseType();
    type.id = dto.id;
    type.book = BookResponseType.fromDto(dto.book);
    type.status = dto.status;
    type.startedAt = dto.startedAt;
    type.finishedAt = dto.finishedAt;
    type.tags = dto.tags?.map(tag => TagResponseType.fromDto(tag));
    type.createdAt = dto.createdAt;
    type.updatedAt = dto.updatedAt;
    return type;
  }
} 