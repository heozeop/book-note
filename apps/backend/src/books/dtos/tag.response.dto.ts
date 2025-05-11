import { Expose } from 'class-transformer';
import { Tag } from '../entities/tag.entity';

/**
 * Tag response DTO
 * Represents a tag in the response
 */
export class TagResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  userId: string;

  /**
   * Transform a Tag entity into a response DTO
   */
  static fromEntity(tag: Tag): TagResponseDto | null {
    if (!tag) {
      return null;
    }
    
    const dto = new TagResponseDto();
    dto.id = tag.id;
    dto.name = tag.name;
    dto.userId = tag.userId;
    
    return dto;
  }
} 