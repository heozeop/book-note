import { Tag } from '../modules/tags/entities/tag.entity';

export class TagResponseDto {
  id: string;
  name: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(tag: Tag): TagResponseDto {    const dto = new TagResponseDto();
    dto.id = tag.id;
    dto.name = tag.name;
    dto.userId = tag.userId;
    dto.createdAt = tag.createdAt;
    dto.updatedAt = tag.updatedAt;

    return dto;
  }
} 