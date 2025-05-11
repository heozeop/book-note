import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { BookCollection } from "../entities/book-collection.entity";

@Injectable()
export class BookCollectionRepository extends BaseRepository<BookCollection> {
  constructor(protected readonly em: EntityManager) {
    super(em, "BookCollection");
  }

  /**
   * 책 ID로 연결된 모든 컬렉션 관계를 찾습니다.
   * @param bookId 책 ID
   * @returns BookCollection 목록
   */
  async findByBookId(bookId: string): Promise<BookCollection[]> {
    return this.find({ book: bookId });
  }

  /**
   * 컬렉션 ID로 연결된 모든 책 관계를 찾습니다.
   * @param collectionId 컬렉션 ID
   * @returns BookCollection 목록
   */
  async findByCollectionId(collectionId: string): Promise<BookCollection[]> {
    return this.find({ collection: collectionId });
  }

  /**
   * 책과 컬렉션 ID로 연결 관계를 찾습니다.
   * @param bookId 책 ID
   * @param collectionId 컬렉션 ID
   * @returns BookCollection 또는 null
   */
  async findByBookIdAndCollectionId(
    bookId: string, 
    collectionId: string
  ): Promise<BookCollection | null> {
    return this.findOne({ book: bookId, collection: collectionId });
  }

  /**
   * 책과 컬렉션 간의 연결을 삭제합니다.
   * @param bookId 책 ID
   * @param collectionId 컬렉션 ID
   * @returns 영향 받은 행 수
   */
  async removeBookFromCollection(
    bookId: string, 
    collectionId: string
  ): Promise<number> {
    const result = await this.nativeDelete({ book: bookId, collection: collectionId });
    return result;
  }

  /**
   * 책과 관련된 모든 컬렉션 연결을 삭제합니다.
   * @param bookId 책 ID
   * @returns 영향 받은 행 수
   */
  async removeAllCollectionsForBook(bookId: string): Promise<number> {
    const result = await this.nativeDelete({ book: bookId });
    return result;
  }

  /**
   * 컬렉션과 관련된 모든 책 연결을 삭제합니다.
   * @param collectionId 컬렉션 ID
   * @returns 영향 받은 행 수
   */
  async removeAllBooksFromCollection(collectionId: string): Promise<number> {
    const result = await this.nativeDelete({ collection: collectionId });
    return result;
  }
} 