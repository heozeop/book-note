import { Injectable } from '@nestjs/common';
import { BookResponseDto, TagResponseDto } from '../dtos';
import { TagService } from '../modules/tags/services/tag.service';

@Injectable()
export class TagFacadeService {
  constructor(
    private readonly tagService: TagService,
  ) {}

  async findAllByUserId(userId: string): Promise<TagResponseDto[]> {
    const tags = await this.tagService.findAllByUserId(userId);
    return tags.map(tag => TagResponseDto.fromEntity(tag));
  }

  async addTagsToBook(bookId: string, tagNames: string[], userId: string): Promise<void> {
    await this.tagService.addTagsToBook(bookId, tagNames, userId);
  }

  async removeTagFromBook(bookId: string, tagName: string, userId: string): Promise<void> {
    await this.tagService.removeTagFromBook(bookId, tagName, userId);
  }

  async findBooksByTag(tagName: string, userId: string): Promise<BookResponseDto[]> {
    const books = await this.tagService.findBooksByTag(tagName, userId);
    return books.map(book => BookResponseDto.fromEntity(book));
  }
} 