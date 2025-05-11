import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../auth/entities/user.entity';
import { CreateBookDto } from '../dtos/create-book.dto';
import { UpdateBookDto } from '../dtos/update-book.dto';
import { Book, BookStatus } from '../entities/book.entity';
import { BookRepository } from '../repositories/book.repository';

@Injectable()
export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  /**
   * 새 책을 생성합니다.
   * @param createBookDto 책 생성 데이터
   * @param owner 책 소유자
   * @returns 생성된 책
   */
  async createBook(createBookDto: CreateBookDto, owner: User): Promise<Book> {
    const book = new Book();
    
    // 기본 정보 설정
    book.title = createBookDto.title;
    book.author = createBookDto.author;
    book.isbn = createBookDto.isbn;
    book.coverImage = createBookDto.coverImage;
    book.description = createBookDto.description;
    book.publisher = createBookDto.publisher;
    book.publishedDate = createBookDto.publishedDate;
    book.totalPages = createBookDto.totalPages;
    book.owner = owner;
    
    // 상태 정보 설정
    if (createBookDto.status) {
      book.status = createBookDto.status;
    }

    // 메타데이터 설정
    if (createBookDto.metadata) {
      book.metadata = createBookDto.metadata;
    }

    await this.bookRepository.persistAndFlush(book);
    return book;
  }

  /**
   * 모든 책을 가져옵니다.
   * @param ownerId 소유자 ID
   * @returns 책 목록
   */
  async findAllBooks(ownerId: string): Promise<Book[]> {
    return this.bookRepository.findByOwnerId(ownerId);
  }

  /**
   * ID로 책을 찾습니다.
   * @param id 책 ID
   * @param ownerId 소유자 ID
   * @returns 책 객체
   */
  async findBookById(id: string, ownerId: string): Promise<Book> {
    const book = await this.bookRepository.findByIdAndOwnerId(id, ownerId);
    
    if (!book) {
      throw new NotFoundException(`ID ${id}인 책을 찾을 수 없습니다.`);
    }
    
    return book;
  }

  /**
   * 상태별로 책을 찾습니다.
   * @param status 책 상태
   * @param ownerId 소유자 ID
   * @returns 책 목록
   */
  async findBooksByStatus(status: BookStatus, ownerId: string): Promise<Book[]> {
    return this.bookRepository.findByStatus(status, ownerId);
  }

  /**
   * 특정 기간 동안 완료된 책을 찾습니다.
   * @param ownerId 소유자 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 완료된 책 목록
   */
  async findCompletedBooks(
    ownerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Book[]> {
    return this.bookRepository.findCompletedBetweenDates(ownerId, startDate, endDate);
  }

  /**
   * 책을 업데이트합니다.
   * @param id 책 ID
   * @param updateBookDto 업데이트 데이터
   * @param ownerId 소유자 ID
   * @returns 업데이트된 책
   */
  async updateBook(
    id: string,
    updateBookDto: UpdateBookDto,
    ownerId: string,
  ): Promise<Book> {
    // 책이 존재하는지 확인
    const book = await this.findBookById(id, ownerId);
    
    // 업데이트 데이터 준비
    const updateData: Partial<Book> = { ...updateBookDto };
    
    // 상태 변경이 있는 경우 추가 처리
    if (updateBookDto.status) {
      // 완료로 상태 변경 시 완료일 설정
      if (updateBookDto.status === BookStatus.COMPLETED && book.status !== BookStatus.COMPLETED) {
        updateData.finishedAt = new Date();
      }
      
      // 읽는 중으로 상태 변경 시 시작일 설정
      if (updateBookDto.status === BookStatus.READING && book.status !== BookStatus.READING) {
        if (!book.startedAt) {
          updateData.startedAt = new Date();
        }
      }
    }
    
    // nativeUpdate를 통한 업데이트 수행
    await this.bookRepository.updateBook(id, updateData);
    
    // 최신 데이터 반환
    return this.findBookById(id, ownerId);
  }

  /**
   * 책 상태를 업데이트합니다.
   * @param id 책 ID
   * @param status 새 상태
   * @param ownerId 소유자 ID
   * @returns 업데이트된 책
   */
  async updateBookStatus(
    id: string,
    status: BookStatus,
    ownerId: string,
  ): Promise<Book> {
    return this.updateBook(id, { status }, ownerId);
  }

  /**
   * 책을 삭제합니다.
   * @param id 책 ID
   * @param ownerId 소유자 ID
   * @returns 삭제 성공 여부
   */
  async deleteBook(id: string, ownerId: string): Promise<boolean> {
    // 책이 존재하는지 확인
    await this.findBookById(id, ownerId);
    
    // nativeDelete를 통한 삭제 수행
    const result = await this.bookRepository.deleteBook(id);
    
    return result > 0;
  }
  
  /**
   * 사용자의 모든 책을 삭제합니다.
   * @param ownerId 소유자 ID
   * @returns 삭제된 책 수
   */
  async deleteAllUserBooks(ownerId: string): Promise<number> {
    return this.bookRepository.deleteAllBooksByOwnerId(ownerId);
  }
} 