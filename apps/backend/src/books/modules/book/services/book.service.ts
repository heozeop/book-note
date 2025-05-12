import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { User } from "../../../../auth/entities/user.entity";
import { Book } from "../entities/book.entity";
import { BookStatus } from "../entities/reading-status.entity";
import { UserBook } from "../entities/user-book.entity";
import { BookRepository } from "../repositories/book.repository";
import { UserBookRepository } from "../repositories/user-book.repository";

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);

  constructor(
    private readonly bookRepository: BookRepository,
    private readonly userBookRepository: UserBookRepository,
  ) {}

  /**
   * Creates a new book
   */
  async createBook(bookData: {
    title: string;
    subTitle?: string;
    author?: string;
    isbn?: string;
    coverUrl?: string;
    description?: string;
    publishedDate?: Date;
    publisher?: string;
    pageCount?: number;
    price?: number;
    discount?: number;
    language?: string;
    externalId?: string;
  }): Promise<Book> {
    let book: Book | null = null;
    
    // Check if book exists by ISBN
    if (bookData.isbn) {
      book = await this.bookRepository.findByIsbn(bookData.isbn);
    }

    // Check if book exists by external ID
    if (!book && bookData.externalId) {
      book = await this.bookRepository.findByExternalBookId(bookData.externalId);
    }

    // Check if book exists by title and author
    if (!book && bookData.title && bookData.author) {
      book = await this.bookRepository.findByTitleAndAuthor(
        bookData.title,
        bookData.author
      );
    }

    // Create new book if it doesn't exist
    if (!book) {
      book = new Book();
      Object.assign(book, bookData);
      await this.bookRepository.persistAndFlush(book);
    }

    return book;
  }

  /**
   * Adds book to user's library
   */
  async addBookToUserLibrary(book: Book, user: User, status: BookStatus = BookStatus.WANT_TO_READ): Promise<UserBook> {
    // Check if user already has this book
    const existingUserBook = await this.userBookRepository.findByUserIdAndBookId(
      user.id,
      book.id
    );

    if (existingUserBook) {
      return existingUserBook;
    }

    // Create user book
    const userBook = new UserBook();
    userBook.user = user;
    userBook.book = book;
    userBook.status = status;

    await this.userBookRepository.persistAndFlush(userBook);
    return userBook;
  }

  /**
   * Creates a book and adds it to user's library
   */
  async createBookForUser(bookData: {
    title: string;
    subTitle?: string;
    author?: string;
    isbn?: string;
    coverUrl?: string;
    description?: string;
    publishedDate?: Date;
    publisher?: string;
    pageCount?: number;
    price?: number;
    discount?: number;
    language?: string;
    externalId?: string;
  }, user: User): Promise<UserBook> {
    const book = await this.createBook(bookData);
    return this.addBookToUserLibrary(book, user);
  }

  /**
   * Find all books for a user, optionally filtered by status
   */
  async findAllBooks(user: User, status?: BookStatus): Promise<UserBook[]> {
    if (status) {
      return this.userBookRepository.findByStatus(status, user.id);
    }
    return this.userBookRepository.findByUserId(user.id);
  }

  /**
   * Find a book by ID for a user
   */
  async findBookById(id: string, user: User): Promise<UserBook> {
    const userBook = await this.userBookRepository.findUserBook(user.id, id);
    if (!userBook) {
      throw new NotFoundException(`Book with ID ${id} not found for this user`);
    }
    
    return userBook;
  }

  /**
   * Update a book
   */
  async updateBook(id: string, updateData: {
    title?: string;
    subTitle?: string;
    author?: string;
    isbn?: string;
    coverUrl?: string;
    description?: string;
    publishedDate?: Date;
    publisher?: string;
    pageCount?: number;
    price?: number;
    discount?: number;
    language?: string;
  }, user: User): Promise<UserBook> {
    // First try to find user's own book
    let userBook = await this.userBookRepository.findUserBook(user.id, id);
    
    // If user doesn't have this book but it exists, add it to their library
    if (!userBook) {
      // Check if the book exists
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
    
    // Update book information
    if (userBook.book) {
      const bookUpdateData: Partial<Book> = {};
      
      // Copy fields to update
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          bookUpdateData[key] = updateData[key];
        }
      });
      
      // Update book information if there are fields to update
      if (Object.keys(bookUpdateData).length > 0) {
        await this.bookRepository.updateBook(userBook.book.id, bookUpdateData);
      }
    }
    
    await this.userBookRepository.flush();
    return this.findBookById(userBook.id, user);
  }

  /**
   * Delete a book from user's library
   */
  async deleteBook(id: string, user: User): Promise<boolean> {
    const userBook = await this.findBookById(id, user);
    
    // Delete user book
    await this.userBookRepository.getEntityManager().removeAndFlush(userBook);
    return true;
  }

  /**
   * Update a book's reading status
   */
  async updateBookStatus(id: string, user: User, status: BookStatus): Promise<UserBook> {
    const userBook = await this.findBookById(id, user);
    
    // Update status
    userBook.status = status;
    
    // Set startedAt date if reading for the first time
    if (status === BookStatus.READING && !userBook.startedAt) {
      userBook.startedAt = new Date();
    }
    
    // Set finishedAt date if completed
    if (status === BookStatus.COMPLETED) {
      userBook.finishedAt = new Date();
      
      // Set startedAt date if not already set
      if (!userBook.startedAt) {
        userBook.startedAt = new Date();
      }
    }
    
    await this.userBookRepository.persistAndFlush(userBook);
    return userBook;
  }

  /**
   * Search books by title query in local database
   */
  async searchBooksByTitleQuery(query: string): Promise<Book[]> {
    return this.bookRepository.findByTitleContaining(query);
  }

  /**
   * Get completed books in a date range
   */
  async getCompletedBooks(user: User, startDate: Date, endDate: Date): Promise<UserBook[]> {
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Find completed books in date range
    return this.userBookRepository.findCompletedBetweenDates(
      user.id,
      startDate,
      endDate
    );
  }
}
