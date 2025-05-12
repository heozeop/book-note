import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TagResponseDto } from '../../dtos/tag.response.dto';

@ObjectType()
export class TagResponseType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  static fromDto(dto: TagResponseDto): TagResponseType {
    const type = new TagResponseType();
    type.id = dto.id;
    type.name = dto.name;
    type.createdAt = dto.createdAt;
    type.updatedAt = dto.updatedAt;
    return type;
  }
} 