import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../../auth/entities/user.entity";
import { CreateUserBookDto } from "../dtos/create-user-book.dto";
import { BookStatus } from "../entities/reading-status.entity";
import { UserBook } from "../entities/user-book.entity";
import { BookRepository } from "../repositories/book.repository";
import { UserBookRepository } from "../repositories/user-book.repository";

@Injectable()
export class UserBookService {
  constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookRepository: BookRepository
  ) {}

  /**
   * 사용자 책을 생성합니다.
   * @param createUserBookDto 사용자 책 생성 DTO
   * @param user 사용자
   * @returns 생성된 사용자 책
   */
  async createUserBook(createUserBookDto: CreateUserBookDto, user: User): Promise<UserBook> {
    // 책 존재 여부 확인
    const book = await this.bookRepository.findOne(createUserBookDto.bookId);
    if (!book) {
      throw new NotFoundException(`ID ${createUserBookDto.bookId}인 책을 찾을 수 없습니다.`);
    }

    // 이미 사용자가 해당 책을 가지고 있는지 확인
    const existingUserBook = await this.userBookRepository.findByUserIdAndBookId(
      user.id,
      book.id
    );

    if (existingUserBook) {
      return existingUserBook;
    }

    // 새 사용자 책 생성
    const userBook = new UserBook();
    userBook.user = user;
    userBook.book = book;
    
    // 선택적 필드 설정
    if (createUserBookDto.isPrivate !== undefined) {
      userBook.isPrivate = createUserBookDto.isPrivate;
    }
    
    if (createUserBookDto.status !== undefined) {
      userBook.status = createUserBookDto.status;
      
      // 읽는 중으로 설정하면 시작 날짜 설정
      if (createUserBookDto.status === BookStatus.READING) {
        userBook.startedAt = new Date();
      }
      
      // 완독으로 설정하면 완료 날짜 설정
      if (createUserBookDto.status === BookStatus.COMPLETED) {
        userBook.finishedAt = new Date();
      }
    }
    
    if (createUserBookDto.rating !== undefined) {
      userBook.rating = createUserBookDto.rating;
    }
    
    if (createUserBookDto.boughtAt !== undefined) {
      userBook.boughtAt = createUserBookDto.boughtAt;
    }
    
    if (createUserBookDto.userNotes !== undefined) {
      userBook.userNotes = createUserBookDto.userNotes;
    }
    
    if (createUserBookDto.currentPage !== undefined) {
      userBook.currentPage = createUserBookDto.currentPage;
    }
    
    if (createUserBookDto.rereadCount !== undefined) {
      userBook.rereadCount = createUserBookDto.rereadCount;
    }

    await this.userBookRepository.persistAndFlush(userBook);
    return userBook;
  }

  /**
   * 사용자의 모든 책을 가져옵니다.
   * @param userId 사용자 ID
   * @returns 사용자 책 목록
   */
  async findAllUserBooks(userId: string): Promise<UserBook[]> {
    return this.userBookRepository.findByUserId(userId);
  }

  /**
   * ID로 사용자 책을 찾습니다.
   * @param id 사용자 책 ID
   * @param userId 사용자 ID
   * @returns 사용자 책
   */
  async findUserBookById(id: string, userId: string): Promise<UserBook> {
    const userBook = await this.userBookRepository.findByIdAndUserId(id, userId);

    if (!userBook) {
      throw new NotFoundException(`ID ${id}인 사용자 책을 찾을 수 없습니다.`);
    }

    return userBook;
  }

  /**
   * 상태별로 사용자 책을 찾습니다.
   * @param status 책 상태
   * @param userId 사용자 ID
   * @returns 사용자 책 목록
   */
  async findUserBooksByStatus(status: BookStatus, userId: string): Promise<UserBook[]> {
    return this.userBookRepository.findByStatus(status, userId);
  }

  /**
   * 특정 기간 동안 완료된 사용자 책을 찾습니다.
   * @param userId 사용자 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 완료된 사용자 책 목록
   */
  async findCompletedUserBooks(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UserBook[]> {
    return this.userBookRepository.findCompletedBetweenDates(userId, startDate, endDate);
  }

  /**
   * 사용자 책을 업데이트합니다.
   * @param id 사용자 책 ID
   * @param updateData 업데이트할 데이터
   * @param userId 사용자 ID
   * @returns 업데이트된 사용자 책
   */
  async updateUserBook(
    id: string,
    updateData: Partial<UserBook>,
    userId: string,
  ): Promise<UserBook> {
    // 사용자 책이 존재하는지 확인
    const userBook = await this.findUserBookById(id, userId);

    // 업데이트 수행
    await this.userBookRepository.updateUserBook(id, updateData);

    // 최신 데이터 반환
    return this.findUserBookById(id, userId);
  }

  /**
   * 사용자 책 상태를 업데이트합니다.
   * @param id 사용자 책 ID
   * @param status 새 상태
   * @param userId 사용자 ID
   * @returns 업데이트된 사용자 책
   */
  async updateUserBookStatus(
    id: string,
    status: BookStatus,
    userId: string,
  ): Promise<UserBook> {
    const updateData: Partial<UserBook> = { status };

    // 완료로 상태 변경 시 완료일 설정
    if (status === BookStatus.COMPLETED) {
      updateData.finishedAt = new Date();
    }

    // 읽는 중으로 상태 변경 시 시작일 설정
    if (status === BookStatus.READING) {
      const userBook = await this.findUserBookById(id, userId);
      if (!userBook.startedAt) {
        updateData.startedAt = new Date();
      }
    }

    return this.updateUserBook(id, updateData, userId);
  }

  /**
   * 사용자 책을 삭제합니다.
   * @param id 사용자 책 ID
   * @param userId 사용자 ID
   * @returns 삭제 성공 여부
   */
  async deleteUserBook(id: string, userId: string): Promise<boolean> {
    // 사용자 책이 존재하는지 확인
    await this.findUserBookById(id, userId);

    // 삭제 수행
    const result = await this.userBookRepository.deleteUserBook(id);

    return result > 0;
  }

  /**
   * 사용자의 모든 책을 삭제합니다.
   * @param userId 사용자 ID
   * @returns 삭제된 책 수
   */
  async deleteAllUserBooks(userId: string): Promise<number> {
    return this.userBookRepository.deleteAllUserBooksByUserId(userId);
  }
} 