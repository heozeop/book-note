import { BaseRepository } from "@/common/repositories/base.repository";
import { EntityManager, FilterQuery } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BookStatus } from "../entities/reading-status.entity";
import { UserBook } from "../entities/user-book.entity";
@Injectable()
export class UserBookRepository extends BaseRepository<UserBook> {
  constructor(protected readonly em: EntityManager) {
    super(em, "UserBook");
  }

  /**
   * 사용자 ID로 모든 사용자 책을 찾습니다.
   * @param userId 사용자 ID
   * @returns 사용자 책 목록
   */
  async findByUserId(userId: string): Promise<UserBook[]> {
    return this.find({ user: { id: userId } }, { populate: ['book'] });
  }

  /**
   * ID와 사용자 ID로 특정 사용자 책을 찾습니다.
   * @param id 사용자 책 ID
   * @param userId 사용자 ID
   * @returns 사용자 책
   */
  async findByIdAndUserId(id: string, userId: string): Promise<UserBook | null> {
    return this.findOne({ id, user: { id: userId } }, { populate: ['book'] });
  }

  /**
   * 사용자 ID와 책 ID로 사용자 책을 찾습니다.
   * @param userId 사용자 ID
   * @param bookId 책 ID
   * @returns 사용자 책
   */
  async findByUserIdAndBookId(userId: string, bookId: string): Promise<UserBook | null> {
    return this.findOne({ user: { id: userId }, book: { id: bookId } }, { populate: ['book'] });
  }

  /**
   * 상태별로 사용자 책을 찾습니다.
   * @param status 책 상태
   * @param userId 사용자 ID
   * @returns 사용자 책 목록
   */
  async findByStatus(status: BookStatus, userId: string): Promise<UserBook[]> {
    return this.find({ status, user: { id: userId } }, { populate: ['book'] });
  }

  /**
   * 특정 기간 동안 완료된 사용자 책을 찾습니다.
   * @param userId 사용자 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 완료된 사용자 책 목록
   */
  async findCompletedBetweenDates(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UserBook[]> {
    const query: FilterQuery<UserBook> = {
      status: BookStatus.COMPLETED,
      user: { id: userId },
      finishedAt: { $gte: startDate, $lte: endDate }
    };
    return this.find(query, { populate: ['book'] });
  }

  /**
   * 사용자 책을 업데이트합니다.
   * @param id 사용자 책 ID
   * @param updateData 업데이트할 데이터
   * @returns 영향을 받은 레코드 수
   */
  async updateUserBook(id: string, updateData: Partial<UserBook>): Promise<number> {
    const result = await this.nativeUpdate({ id }, updateData);
    return result;
  }

  /**
   * 사용자 책을 삭제합니다.
   * @param id 사용자 책 ID
   * @returns 영향을 받은 레코드 수
   */
  async deleteUserBook(id: string): Promise<number> {
    return this.nativeDelete({ id });
  }

  /**
   * 사용자의 모든 책을 삭제합니다.
   * @param userId 사용자 ID
   * @returns 삭제된 책 수
   */
  async deleteAllUserBooksByUserId(userId: string): Promise<number> {
    return this.nativeDelete({ user: { id: userId } });
  }

  /**
   * 사용자의 모든 책을 조회합니다.
   * @param userId 사용자 ID
   * @returns 사용자 책 목록
   */
  findAllByUserId(userId: string): Promise<UserBook[]> {
    return this.find({ user: userId });
  }

  /**
   * 사용자의 특정 책을 조회합니다.
   * @param userId 사용자 ID
   * @param bookId 책 ID
   * @returns 사용자 책 정보 
   */
  async findUserBook(userId: string, bookId: string): Promise<UserBook | null> {
    // Try to find using the UserBook ID first
    const userBookById = await this.findOne({ id: bookId, user: { id: userId } }, { populate: ['book'] });
    if (userBookById) {
      return userBookById;
    }
    
    // If not found, try to find by book ID
    return this.findOne({ book: { id: bookId }, user: { id: userId } }, { populate: ['book', 'bookTags'] });
  }

  /**
   * 사용자의 읽기 상태별 책을 조회합니다.
   * @param userId 사용자 ID
   * @param status 책 상태
   * @returns 해당 상태의 책 목록
   */
  findByUserIdAndStatus(userId: string, status: BookStatus): Promise<UserBook[]> {
    return this.find({ user: userId, status });
  }

  /**
   * 특정 기간 내 완독한 책을 조회합니다.
   * @param userId 사용자 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 완독 책 목록
   */
  findCompletedBooks(userId: string, startDate: Date, endDate: Date): Promise<UserBook[]> {
    return this.findCompletedBetweenDates(userId, startDate, endDate);
  }

  /**
   * 사용자의 태그별 책을 조회합니다.
   * @param userId 사용자 ID
   * @param tag 태그명
   * @returns 태그가 지정된 책 목록
   */
  async findByUserIdAndTag(userId: string, tag: string): Promise<UserBook[]> {
    // TODO: Implement proper tag filtering once the entities are properly set up
    // For now, return all user books
    return this.find({ user: userId });
  }
} 