import { Injectable, NotFoundException } from "@nestjs/common";
import { TagResponseDto } from "../dtos/tag.response.dto";
import { Tag } from "../entities/tag.entity";
import { BookTagRepository } from "../repositories/book-tag.repository";
import { BookRepository } from "../repositories/book.repository";
import { TagRepository } from "../repositories/tag.repository";
import { UserBookRepository } from "../repositories/user-book.repository";

@Injectable()
export class TagService {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly bookRepository: BookRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly bookTagRepository: BookTagRepository
  ) {}

  /**
   * 사용자의 모든 태그를 조회합니다.
   */
  async findAllByUserId(userId: string): Promise<TagResponseDto[]> {
    const tags = await this.tagRepository.findByUserId(userId);
    return tags.map(tag => TagResponseDto.fromEntity(tag)).filter(dto => dto !== null);
  }

  /**
   * 태그 이름으로 태그를 조회하거나 생성합니다.
   */
  async findOrCreateTag(tagName: string, userId: string): Promise<Tag> {
    // 이미 존재하는 태그인지 확인
    let tag = await this.tagRepository.findByNameAndUserId(tagName, userId);
    
    // 없으면 새로 생성
    if (!tag) {
      tag = new Tag();
      tag.name = tagName;
      tag.userId = userId;
      await this.tagRepository.persistAndFlush(tag);
    }
    
    return tag;
  }

  /**
   * 책에 태그를 추가합니다.
   */
  async addTagsToBook(bookId: string, tagNames: string[], userId: string): Promise<void> {
    // 책이 존재하는지 확인
    const book = await this.bookRepository.findOne(bookId);
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // 사용자의 책 정보 조회
    const userBook = await this.userBookRepository.findUserBook(userId, bookId);
    if (!userBook) {
      throw new NotFoundException(`UserBook with bookId ${bookId} not found`);
    }

    // 각 태그에 대해 처리
    for (const tagName of tagNames) {
      // 태그 찾거나 생성
      const tag = await this.findOrCreateTag(tagName, userId);
      
      // 이미 책에 태그가 있는지 확인
      const existingBookTags = await this.bookTagRepository.find({
        userBook: userBook,
        tag: tag
      });
      
      // 없으면 추가
      if (!existingBookTags || existingBookTags.length === 0) {
        await this.bookTagRepository.createBookTag(userBook, tag);
      }
    }
  }

  /**
   * 책에서 태그를 제거합니다.
   */
  async removeTagFromBook(bookId: string, tagName: string, userId: string): Promise<void> {
    // 책이 존재하는지 확인
    const book = await this.bookRepository.findOne(bookId);
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // 사용자의 책 정보 조회
    const userBook = await this.userBookRepository.findUserBook(userId, bookId);
    if (!userBook) {
      throw new NotFoundException(`UserBook with bookId ${bookId} not found`);
    }

    // 태그 찾기
    const tag = await this.tagRepository.findByNameAndUserId(tagName, userId);
    if (!tag) {
      throw new NotFoundException(`Tag with name ${tagName} not found`);
    }

    // 책에서 태그 제거
    await this.bookTagRepository.removeBookTag(userBook.id, tag.id);
  }

  /**
   * 태그로 책을 조회합니다.
   */
  async findBooksByTag(tagName: string, userId: string): Promise<any[]> {
    // 태그 찾기
    const tag = await this.tagRepository.findByNameAndUserId(tagName, userId);
    if (!tag) {
      return [];
    }
    
    // 태그가 지정된 UserBook 조회
    return this.bookTagRepository.findUserBooksByTag(tag.id);
  }
} 