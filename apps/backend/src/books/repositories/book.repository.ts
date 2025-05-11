import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { Book, BookStatus } from "../entities/book.entity";

@Injectable()
export class BookRepository extends BaseRepository<Book> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Book");
  }

  /**
   * 사용자 ID로 책을 찾습니다.
   * @param ownerId 소유자 ID
   * @returns 책 목록
   */
  async findByOwnerId(ownerId: string): Promise<Book[]> {
    return this.find({ owner: ownerId });
  }

  /**
   * 책 ID와 소유자 ID로 책을 찾습니다.
   * @param id 책 ID
   * @param ownerId 소유자 ID
   * @returns 책 또는 null
   */
  async findByIdAndOwnerId(id: string, ownerId: string): Promise<Book | null> {
    return this.findOne({ id, owner: ownerId });
  }

  /**
   * 상태별로 책을 찾습니다.
   * @param status 책 상태
   * @param ownerId 소유자 ID
   * @returns 책 목록
   */
  async findByStatus(status: BookStatus, ownerId: string): Promise<Book[]> {
    return this.find({ status, owner: ownerId });
  }

  /**
   * 특정 기간 동안 완료된 책을 찾습니다.
   * @param ownerId 소유자 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 완료된 책 목록
   */
  async findCompletedBetweenDates(
    ownerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Book[]> {
    return this.find({
      owner: ownerId,
      status: BookStatus.COMPLETED,
      finishedAt: { $gte: startDate, $lte: endDate },
    });
  }

  /**
   * 책을 업데이트합니다 (nativeUpdate 사용).
   * @param id 책 ID
   * @param data 업데이트할 데이터
   * @returns 영향 받은 행 수
   */
  async updateBook(id: string, data: Partial<Book>): Promise<number> {
    const result = await this.nativeUpdate({ id }, data);
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

  /**
   * 사용자의 모든 책을 삭제합니다 (nativeDelete 사용).
   * @param ownerId 소유자 ID
   * @returns 영향 받은 행 수
   */
  async deleteAllBooksByOwnerId(ownerId: string): Promise<number> {
    const result = await this.nativeDelete({ owner: ownerId });
    return result;
  }
}
