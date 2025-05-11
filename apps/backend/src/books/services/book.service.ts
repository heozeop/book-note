import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { User } from "../../auth/entities/user.entity";
import { CreateBookDto } from "../dtos/create-book.dto";
import { TagResponseDto } from "../dtos/tag.response.dto";
import { UpdateBookDto } from "../dtos/update-book.dto";
import { Book } from "../entities/book.entity";
import { BookStatus } from "../entities/reading-status.entity";
import { UserBook } from "../entities/user-book.entity";
import { BookItem, BookSearchResponse, IBookSearchService } from '../modules/book-search/interfaces/book-search.interface';
import { BookTagRepository } from "../repositories/book-tag.repository";
import { BookRepository } from "../repositories/book.repository";
import { TagRepository } from "../repositories/tag.repository";
import { UserBookRepository } from "../repositories/user-book.repository";
import { TagService } from "./tag.service";

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);

  constructor(
    private readonly bookRepository: BookRepository,
    private readonly userBookRepository: UserBookRepository,
    @Inject('BOOK_SEARCH_SERVICE')
    private readonly bookSearchService: IBookSearchService,
    private readonly bookTagRepository: BookTagRepository,
    private readonly tagRepository: TagRepository,
    private readonly tagService: TagService,
  ) {}

  /**
   * 새 책을 생성하고 사용자의 서재에 추가합니다.
   * @param createBookDto 책 생성 DTO
   * @param user 사용자
   * @returns 생성된 사용자 책
   */
  async createBook(createBookDto: CreateBookDto, user: User): Promise<UserBook> {
    let book: Book | null = null;
    
    // ISBN이 제공된 경우 중복 체크
    if (createBookDto.isbn) {
      book = await this.bookRepository.findByIsbn(createBookDto.isbn);
    }

    // Naver Book ID가 제공된 경우 중복 체크
    if (!book && createBookDto.externalId) {
      book = await this.bookRepository.findByExternalBookId(createBookDto.externalId);
    }

    // 제목과 저자가 모두 제공된 경우 중복 체크
    if (!book && createBookDto.title && createBookDto.author) {
      book = await this.bookRepository.findByTitleAndAuthor(
        createBookDto.title,
        createBookDto.author
      );
    }

    // 새 책 엔티티 생성
    if (!book) {
      book = new Book();
      Object.assign(book, createBookDto);
      await this.bookRepository.persistAndFlush(book);
    }

    // 이미 사용자가 해당 책을 가지고 있는지 확인
    const existingUserBook = await this.userBookRepository.findByUserIdAndBookId(
      user.id,
      book.id
    );

    if (existingUserBook) {
      return existingUserBook;
    }

    // 사용자 책 생성
    const userBook = new UserBook();
    userBook.user = user;
    userBook.book = book;
    userBook.status = BookStatus.WANT_TO_READ;

    await this.userBookRepository.persistAndFlush(userBook);
    return userBook;
  }

  /**
   * Get tags for a user's book
   * @param userBookId User book ID
   * @returns Array of tag response DTOs
   */
  async getTagsForUserBook(userBookId: string): Promise<TagResponseDto[]> {
    const tags = await this.bookTagRepository.findTagsByUserBook(userBookId);
    return tags.map(tag => TagResponseDto.fromEntity(tag)).filter(dto => dto !== null);
  }

  /**
   * 사용자의 모든 책을 조회합니다.
   * @param user 사용자
   * @param status 선택적 상태 필터
   * @returns 사용자 책 목록
   */
  async findAllBooks(user: User, status?: BookStatus): Promise<UserBook[]> {
    if (status) {
      return this.userBookRepository.findByStatus(status, user.id);
    }
    return this.userBookRepository.findByUserId(user.id);
  }

  /**
   * ID로 사용자의 책을 조회합니다.
   * @param id 책 ID
   * @param user 사용자
   * @returns 사용자 책
   */
  async findBookById(id: string, user: User): Promise<UserBook> {
    const userBook = await this.userBookRepository.findUserBook(user.id, id);
    if (!userBook) {
      throw new NotFoundException(`ID ${id}인 책을 찾을 수 없습니다.`);
    }
    
    return userBook;
  }

  /**
   * ID로 사용자의 책을 조회하고 태그를 포함합니다.
   * @param id 책 ID
   * @param user 사용자
   * @returns 사용자 책과 태그
   */
  async findBookByIdWithTags(id: string, user: User): Promise<{ userBook: UserBook; tags: TagResponseDto[] }> {
    const userBook = await this.findBookById(id, user);
    const tags = await this.getTagsForUserBook(userBook.id);
    return { userBook, tags };
  }

  /**
   * 사용자 책을 업데이트합니다.
   * @param id 책 ID
   * @param updateData 업데이트할 데이터
   * @param user 사용자
   * @returns 업데이트된 사용자 책
   */
  async updateBook(id: string, updateData: UpdateBookDto, user: User): Promise<UserBook> {
    // First try to find user's own book
    let userBook = await this.userBookRepository.findUserBook(user.id, id);
    
    // If the current user doesn't have this book but it exists for another user,
    // we should first add it to the current user's books
    if (!userBook) {
      // Check if the book exists at all
      const book = await this.bookRepository.findOne(id);
      
      if (!book) {
        // Try to find by userBook ID
        const userBookById = await this.userBookRepository.findOne(id);
        if (userBookById && userBookById.book) {
          // Create a new UserBook for the current user
          userBook = new UserBook();
          userBook.user = user;
          userBook.book = userBookById.book;
          userBook.status = BookStatus.WANT_TO_READ;
          await this.userBookRepository.persistAndFlush(userBook);
        } else {
          throw new NotFoundException(`Book with ID ${id} not found`);
        }
      } else {
        // Create a new UserBook for the user with this existing book
        userBook = new UserBook();
        userBook.user = user;
        userBook.book = book;
        userBook.status = BookStatus.WANT_TO_READ;
        await this.userBookRepository.persistAndFlush(userBook);
      }
    }
    
    // Book information update
    if (userBook.book) {
      const bookUpdateData: Partial<Book> = {};
      
      // Copy fields to update
      if (updateData.title !== undefined) bookUpdateData.title = updateData.title;
      if (updateData.author !== undefined) bookUpdateData.author = updateData.author;
      if (updateData.description !== undefined) bookUpdateData.description = updateData.description;
      if (updateData.isbn !== undefined) bookUpdateData.isbn = updateData.isbn;
      if (updateData.coverUrl !== undefined) bookUpdateData.coverUrl = updateData.coverUrl;
      if (updateData.publisher !== undefined) bookUpdateData.publisher = updateData.publisher;
      if (updateData.pageCount !== undefined) bookUpdateData.pageCount = updateData.pageCount;
      
      // Update book information if there are fields to update
      if (Object.keys(bookUpdateData).length > 0) {
        await this.bookRepository.updateBook(userBook.book.id, bookUpdateData);
      }
    }
    
    await this.userBookRepository.flush();
    return this.findBookById(userBook.id, user);
  }

  /**
   * 책을 삭제합니다.
   * @param id 책 ID
   * @param user 사용자
   * @returns 삭제 성공 여부
   */
  async deleteBook(id: string, user: User): Promise<boolean> {
    const userBook = await this.findBookById(id, user);
    
    // 사용자 책 삭제
    await this.userBookRepository.getEntityManager().removeAndFlush(userBook);
    return true;
  }

  /**
   * ISBN으로 책을 검색하고 생성합니다.
   */
  async createBookFromIsbn(isbn: string, user: User): Promise<UserBook> {
    // 우선 이미 존재하는 책인지 확인
    const existingBook = await this.bookRepository.findByIsbn(isbn);
    if (existingBook) {
      // 사용자가 이미 이 책을 가지고 있는지 확인
      const existingUserBook = await this.userBookRepository.findByUserIdAndBookId(
        user.id, 
        existingBook.id
      );
      
      if (existingUserBook) {
        return existingUserBook;
      }
      
      // 사용자 책 생성
      const userBook = new UserBook();
      userBook.user = user;
      userBook.book = existingBook;
      userBook.status = BookStatus.WANT_TO_READ;
      
      await this.userBookRepository.persistAndFlush(userBook);
      return userBook;
    }

    // 네이버 API를 통해 책 정보 검색
    const bookData = await this.bookSearchService.searchByIsbn(isbn);
    
    if (!bookData) {
      throw new NotFoundException(`Book with ISBN ${isbn} not found`);
    }

    return this.createBookFromSearchData(bookData, user);
  }

  /**
   * 검색 API 데이터로부터 책을 생성합니다.
   */
  async createBookFromSearchData(bookData: any, user: User): Promise<UserBook> {
    let book: Book | null = null;
    
    // 우선 ISBN으로 이미 존재하는지 확인
    if (bookData.isbn) {
      book = await this.bookRepository.findByIsbn(bookData.isbn);
    }

    // 외부 ID로 찾기 (예: 네이버 책 ID)
    if (!book && bookData.externalId) {
      book = await this.bookRepository.findOne({ externalId: bookData.externalId });
    }

    // 제목과 저자로 찾기
    if (!book && bookData.title && bookData.author) {
      book = await this.bookRepository.findOne({
        title: bookData.title,
        author: bookData.author,
      });
    }

    // 새 책 생성
    if (!book) {
      book = new Book();
      book.title = bookData.title;
      book.author = bookData.author;
      book.isbn = bookData.isbn;
      book.description = bookData.description;
      book.coverUrl = bookData.coverUrl;
      book.publisher = bookData.publisher;
      book.publishedDate = bookData.publishedDate;
      book.price = bookData.price;
      book.discount = bookData.discount;
      book.pageCount = bookData.pageCount;
      
      if (bookData.externalId) {
        book.externalId = bookData.externalId;
      }

      await this.bookRepository.persistAndFlush(book);
    }
    
    // 사용자가 이미 이 책을 가지고 있는지 확인
    const existingUserBook = await this.userBookRepository.findByUserIdAndBookId(
      user.id, 
      book.id
    );
    
    if (existingUserBook) {
      return existingUserBook;
    }
    
    // 사용자 책 생성
    const userBook = new UserBook();
    userBook.user = user;
    userBook.book = book;
    userBook.status = BookStatus.WANT_TO_READ;
    
    await this.userBookRepository.persistAndFlush(userBook);
    return userBook;
  }

  /**
   * ISBN으로 책을 검색합니다.
   * @param isbn ISBN 코드
   * @returns 검색된 책 정보 또는 null
   */
  async searchBookByIsbn(isbn: string): Promise<BookItem | null> {
    return this.bookSearchService.searchByIsbn(isbn);
  }

  /**
   * 키워드로 책을 검색합니다.
   * @param query 검색 키워드
   * @param options 검색 옵션 (페이지네이션, 정렬)
   * @returns 검색 결과
   */
  async searchBooksByKeyword(query: string, options: {
    display?: number;
    start?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<BookSearchResponse> {
    try {
      // Default values
      const display = options.display || 10;
      const start = options.start || 1;
      const sort = options.sort || 'sim'; // Default to relevance
      
      // Calculate page number for response
      const page = Math.ceil(start / display);
      
      // Call the search service with appropriate parameters
      const result = await this.bookSearchService.searchBooks({
        query,
        display,
        start,
        sort
      });
      
      // Add page information to the response
      return {
        ...result,
        page,
      };
    } catch (error) {
      this.logger.error(`Error searching books by keyword: ${error.message}`, error.stack);
      // Return empty result set on error
      return {
        total: 0,
        start: options.start || 1,
        display: options.display || 10,
        page: Math.ceil((options.start || 1) / (options.display || 10)),
        items: []
      };
    }
  }

  /**
   * 완독한 책 목록을 가져옵니다.
   * @param user 사용자
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 완독한 책 목록
   */
  async getCompletedBooks(user: User, startDate: Date, endDate: Date): Promise<UserBook[]> {
    // 날짜 유효성 검사
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('유효하지 않은,날짜 형식입니다.');
    }

    // finishedAt이 지정된 날짜 범위 내에 있고 status가 COMPLETED인 책만 조회
    return this.userBookRepository.findCompletedBetweenDates(
      user.id,
      startDate,
      endDate
    );
  }

  /**
   * 책의 독서 상태를 업데이트합니다.
   * @param bookId 책 ID
   * @param user 사용자
   * @param status 변경할 상태
   * @returns 업데이트된 UserBook 정보
   */
  async updateBookStatus(bookId: string, user: User, status: BookStatus): Promise<UserBook> {
    const userBook = await this.findBookById(bookId, user);
    
    // 상태 업데이트
    userBook.status = status;
    
    // 읽기 시작 날짜 설정 (처음 READING으로 변경 시)
    if (status === BookStatus.READING && !userBook.startedAt) {
      userBook.startedAt = new Date();
    }
    
    // 읽기 완료 날짜 설정 (COMPLETED로 변경 시)
    if (status === BookStatus.COMPLETED) {
      userBook.finishedAt = new Date();
      
      // 시작 날짜가 없는 경우 시작 날짜도 설정
      if (!userBook.startedAt) {
        userBook.startedAt = new Date();
      }
    }
    
    await this.userBookRepository.persistAndFlush(userBook);
    return userBook;
  }

  /**
   * 제목으로 책을 검색합니다.
   */
  async searchBooksByTitle(title: string, options?: { display?: number; start?: number }) {
    return this.bookSearchService.searchByTitle(title, options);
  }

  /**
   * 제목 검색어로 책을 조회합니다.
   * @param query 검색어
   * @returns 책 목록
   */
  async searchBooksByTitleQuery(query: string): Promise<Book[]> {
    return this.bookRepository.findByTitleContaining(query);
  }

  /**
   * 제목 검색어로 책을 조회하고 각 책에 대한 태그를 가져옵니다.
   * @param query 검색어
   * @returns 책 목록과 각 책의 태그 정보
   */
  async searchBooksByTitleQueryWithTags(query: string): Promise<{ books: Book[]; tagsByBookId: Record<string, TagResponseDto[]> }> {
    const books = await this.searchBooksByTitleQuery(query);
    const tagsByBookId: Record<string, TagResponseDto[]> = {};
    
    // Books don't have tags directly, we'd need UserBooks to get tags
    // This is just a placeholder for the structure
    
    return { books, tagsByBookId };
  }
}
