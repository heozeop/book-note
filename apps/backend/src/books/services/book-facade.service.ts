import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../auth/entities/user.entity';
import {
  BookResponseDto,
  BookSearchItemResponseDto,
  BookSearchResponseDto,
  CreateBookDto,
  TagResponseDto,
  UpdateBookDto,
  UserBookResponseDto
} from '../dtos';
import { IBookSearchService } from '../modules/book-search/interfaces/book-search.interface';
import { BookStatus } from '../modules/book/entities/reading-status.entity';
import { BookService } from '../modules/book/services/book.service';
import { TagService } from '../modules/tags/services/tag.service';

@Injectable()
export class BookFacadeService {
  constructor(
    private readonly bookService: BookService,
    private readonly tagService: TagService,
    @Inject('BOOK_SEARCH_SERVICE')
    private readonly bookSearchService: IBookSearchService,
  ) {}

  async createBook(createBookDto: CreateBookDto, user: User): Promise<UserBookResponseDto> {
    // First create or find the book
    const book = await this.bookService.createBook(createBookDto);

    // Then add it to the user's library
    const userBook = await this.bookService.addBookToUserLibrary(
      book, 
      user, 
      createBookDto.status || BookStatus.WANT_TO_READ
    );

    // Add tags if provided using the optimized method
    if (createBookDto.tags && createBookDto.tags.length > 0) {
      await this.tagService.addTagsToBook(userBook.id, createBookDto.tags, user.id);
    }

    // Get tags for response
    const tags = await this.tagService.getTagsForUserBook(userBook.id);
    const tagDtos = tags.map(tag => TagResponseDto.fromEntity(tag));
    
    return UserBookResponseDto.fromEntity(userBook, tagDtos);
  }

  async createBookFromIsbn(isbn: string, user: User): Promise<UserBookResponseDto> {
    // Search for book by ISBN in external API
    const bookData = await this.bookSearchService.searchByIsbn(isbn);
    if (!bookData) {
      throw new NotFoundException(`Book with ISBN ${isbn} not found in external API`);
    }

    try {
      // Create the book using the found data
      return await this.createBookFromSearchData(bookData, user);
    } catch (error) {
      // Add more specific error handling if needed
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to create book from ISBN ${isbn}: ${error.message}`);
    }
  }

  async createBookFromSearchData(bookData: BookSearchItemResponseDto, user: User): Promise<UserBookResponseDto> {
    // Create the book using data from search
    const book = await this.bookService.createBook(bookData);

    // Add it to the user's library
    const userBook = await this.bookService.addBookToUserLibrary(book, user);
    
    // Get tags for response (none yet for new books from search)
    const tags = await this.tagService.getTagsForUserBook(userBook.id);
    const tagDtos = tags.map(tag => TagResponseDto.fromEntity(tag));
    
    return UserBookResponseDto.fromEntity(userBook, tagDtos);
  }

  async findAllBooks(user: User, status?: BookStatus): Promise<UserBookResponseDto[]> {
    // Get all user books in a single query
    const userBooks = await this.bookService.findAllBooks(user, status);
    
    if (userBooks.length === 0) {
      return [];
    }
    
    // Get all user book IDs
    const userBookIds = userBooks.map(userBook => userBook.id);
    
    // Fetch all tags for all books in a single query
    const tagsByUserBookId = await this.tagService.getTagsForUserBooks(userBookIds);
    
    // Map user books to DTOs with their tags
    return userBooks.map(userBook => {
      const tags = tagsByUserBookId[userBook.id] || [];
      const tagDtos = tags.map(tag => TagResponseDto.fromEntity(tag));
      return UserBookResponseDto.fromEntity(userBook, tagDtos);
    }).filter(Boolean); // Filter out any null results
  }

  async findBookById(id: string, user: User): Promise<UserBookResponseDto> {
    const userBook = await this.bookService.findBookById(id, user);
    if (!userBook) {
      throw new NotFoundException(`Book with ID ${id} not found for this user`);
    }
    
    const tags = await this.tagService.getTagsForUserBook(userBook.id);
    const tagDtos = tags.map(tag => TagResponseDto.fromEntity(tag));
    
    return UserBookResponseDto.fromEntity(userBook, tagDtos);
  }

  async updateBook(id: string, updateBookDto: UpdateBookDto, user: User): Promise<UserBookResponseDto> {
    const userBook = await this.bookService.updateBook(id, updateBookDto, user);
    
    // Update tags if provided
    if (Array.isArray(updateBookDto.tags) && updateBookDto.tags.length > 0) {
      // First remove all existing tags
      await this.tagService.removeAllTagsFromUserBook(userBook.id);
      
      // Then add new tags (using the optimized method)
      await this.tagService.addTagsToBook(userBook.id, updateBookDto.tags, user.id);
    }
    
    // Get updated tags for the response
    const tags = await this.tagService.getTagsForUserBook(userBook.id);
    const tagDtos = tags.map(tag => TagResponseDto.fromEntity(tag));
    
    return UserBookResponseDto.fromEntity(userBook, tagDtos);
  }

  async updateBookStatus(id: string, status: BookStatus, user: User): Promise<UserBookResponseDto> {
    const userBook = await this.bookService.updateBookStatus(id, user, status);
    const tags = await this.tagService.getTagsForUserBook(userBook.id);
    const tagDtos = tags.map(tag => TagResponseDto.fromEntity(tag));
    
    return UserBookResponseDto.fromEntity(userBook, tagDtos);
  }

  async deleteBook(id: string, user: User): Promise<boolean> {
    return this.bookService.deleteBook(id, user);
  }

  async searchBookByIsbn(isbn: string): Promise<BookSearchItemResponseDto | null> {
    const bookItem = await this.bookSearchService.searchByIsbn(isbn);
    if (!bookItem) {
      throw new NotFoundException(`Book with ISBN ${isbn} not found in external API`);
    }

    return BookSearchItemResponseDto.fromBookItem(bookItem);
  }

  async searchBooksByKeyword(
    query: string, 
    options: {
      display?: number;
      start?: number;
      sort?: string;
      order?: 'asc' | 'desc';
    }
  ): Promise<BookSearchResponseDto> {
    const searchResponse = await this.bookSearchService.searchBooks({
      query,
      display: options.display,
      start: options.start,
      sort: options.sort
    });
    
    return BookSearchResponseDto.fromSearchResponse(searchResponse);
  }

  async searchBooksByTitle(title: string, options?: { display?: number; start?: number }): Promise<BookSearchResponseDto> {
    const searchResponse = await this.bookSearchService.searchByTitle(title, options);
    return BookSearchResponseDto.fromSearchResponse(searchResponse);
  }

  async searchBooksByTitleQuery(query: string): Promise<BookResponseDto[]> {
    const books = await this.bookService.searchBooksByTitleQuery(query);
    const tags = await this.tagService.getTagsForUserBooks(books.map(book => book.id));

    return books.map(book => {
      return BookResponseDto.fromEntity(book, tags[book.id]);
    });
  }

  async getCompletedBooks(user: User, startDate: Date, endDate: Date): Promise<UserBookResponseDto[]> {
    // Get all completed books in a single query
    const userBooks = await this.bookService.getCompletedBooks(user, startDate, endDate);
    
    if (userBooks.length === 0) {
      return [];
    }
    
    // Get all user book IDs
    const userBookIds = userBooks.map(userBook => userBook.id);
    
    // Fetch all tags for all books in a single query
    const tagsByUserBookId = await this.tagService.getTagsForUserBooks(userBookIds);
    
    // Map user books to DTOs with their tags
    return userBooks.map(userBook => {
      const tags = tagsByUserBookId[userBook.id] || [];
      const tagDtos = tags.map(tag => TagResponseDto.fromEntity(tag));
      return UserBookResponseDto.fromEntity(userBook, tagDtos);
    });
  }
} 