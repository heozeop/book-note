import { EntityManager, FilterQuery, FindOneOptions } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { Book } from "../entities/book.entity";
import { Loaded } from "@mikro-orm/core";

@Injectable()
export class BookRepository extends BaseRepository<Book> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Book");
  }

  /**
   * Override findOne to enhance behavior
   * @param where Query filter or ID string
   * @param options Find options
   * @returns Book or null
   */
  override async findOne<Hint extends string = never, Fields extends string = "*", Excludes extends string = never>(
    where: string | FilterQuery<Book>,
    options?: FindOneOptions<Book, Hint, Fields, Excludes>,
  ): Promise<Loaded<Book, Hint, Fields, Excludes> | null> {
    if (typeof where === 'string') {
      return super.findOne({ id: where } as FilterQuery<Book>, options);
    }
    return super.findOne(where, options);
  }

  /**
   * 특정 ISBN으로 책을 찾습니다.
   * @param isbn ISBN
   * @returns 책 (또는 null)
   */
  async findByIsbn(isbn: string): Promise<Book | null> {
    return this.findOne({ isbn });
  }

  /**
   * Naver Book ID로 책을 찾습니다.
   * @param naverBookId Naver Book ID
   * @returns 책 (또는 null)
   */
  async findByExternalBookId(externalBookId: string): Promise<Book | null> {
    return this.findOne({ externalId: externalBookId });
  }

  /**
   * 제목과 저자로 책을 찾습니다.
   * @param title 제목
   * @param author 저자
   * @returns 책 (또는 null)
   */
  async findByTitleAndAuthor(title: string, author: string): Promise<Book | null> {
    return this.findOne({ title, author });
  }

  /**
   * 제목으로 책을 검색합니다.
   * @param titleQuery 제목 쿼리 (부분 일치)
   * @returns 책 목록
   */
  async findByTitleContaining(titleQuery: string): Promise<Book[]> {
    const titleFilter: FilterQuery<Book> = { title: { $like: `%${titleQuery}%` } };
    return this.find(titleFilter, { limit: 20 });
  }

  /**
   * 여러 ISBN으로 책을 찾습니다.
   * @param isbns ISBN 배열
   * @returns 책 목록
   */
  async findByIsbns(isbns: string[]): Promise<Book[]> {
    return this.find({ isbn: { $in: isbns } });
  }

  /**
   * 책 정보를 업데이트합니다.
   * @param id 책 ID
   * @param updateData 업데이트할 데이터
   * @returns 영향을 받은 레코드 수
   */
  async updateBook(id: string, updateData: Partial<Book>): Promise<number> {
    const result = await this.nativeUpdate({ id }, updateData);
    return result;
  }

  /**
   * 책을 삭제합니다 (nativeDelete 사용).
   * @param id 책 ID
   * @returns 영향 받은 행 수
   */
  async deleteBook(id: string): Promise<number> {
    const result = await this.nativeDelete({ id });
    return result;
  }
}
