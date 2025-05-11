import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { BookTag } from "../entities/book-tag.entity";
import { Tag } from "../entities/tag.entity";
import { UserBook } from "../entities/user-book.entity";

@Injectable()
export class BookTagRepository extends BaseRepository<BookTag> {
  constructor(protected readonly em: EntityManager) {
    super(em, "BookTag");
  }

  /**
   * 새로운 책-태그 관계를 생성합니다.
   */
  async createBookTag(userBook: UserBook, tag: Tag): Promise<BookTag> {
    const bookTag = new BookTag();
    bookTag.userBook = userBook;
    bookTag.tag = tag;
    
    await this.persistAndFlush(bookTag);
    return bookTag;
  }

  /**
   * 사용자 책에 연결된 모든 태그를 조회합니다.
   */
  async findTagsByUserBook(userBookId: string): Promise<Tag[]> {
    const bookTags = await this.find(
      { userBook: userBookId },
      { populate: ['tag'] }
    );
    
    return bookTags.map(bookTag => bookTag.tag);
  }

  /**
   * 특정 태그가 지정된 모든 사용자 책을 조회합니다.
   */
  async findUserBooksByTag(tagId: string): Promise<UserBook[]> {
    const bookTags = await this.find(
      { tag: tagId },
      { populate: ['userBook'] }
    );
    
    return bookTags.map(bookTag => bookTag.userBook);
  }

  /**
   * 책-태그 관계를 삭제합니다.
   */
  async removeBookTag(userBookId: string, tagId: string): Promise<void> {
    const bookTag = await this.findOne({
      userBook: userBookId,
      tag: tagId
    });
    
    if (bookTag) {
      await this.getEntityManager().removeAndFlush(bookTag);
    }
  }

  /**
   * 사용자 책에 지정된 모든 태그를 삭제합니다.
   */
  async removeAllTagsFromUserBook(userBookId: string): Promise<void> {
    const bookTags = await this.find({ userBook: userBookId });
    
    for (const bookTag of bookTags) {
      await this.getEntityManager().removeAndFlush(bookTag);
    }
  }
} 