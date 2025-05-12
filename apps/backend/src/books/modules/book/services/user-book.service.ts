import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../../../../auth/entities/user.entity";
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
   * Create a user book
   */
  async createUserBook(
    createUserBookDto: {
      bookId: string;
      status?: BookStatus;
      isPrivate?: boolean;
      rating?: number;
      boughtAt?: Date;
      userNotes?: string;
      currentPage?: number;
      rereadCount?: number;
    }, 
    user: User
  ): Promise<UserBook> {
    // Find the book
    const book = await this.bookRepository.findOne(createUserBookDto.bookId);
    if (!book) {
      throw new NotFoundException(`Book with ID ${createUserBookDto.bookId} not found`);
    }

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
    userBook.status = createUserBookDto.status || BookStatus.WANT_TO_READ;
    
    // Set optional fields if provided
    if (createUserBookDto.isPrivate !== undefined) {
      userBook.isPrivate = createUserBookDto.isPrivate;
    }
    
    if (createUserBookDto.rating !== undefined) {
      userBook.rating = createUserBookDto.rating;
    }
    
    if (createUserBookDto.boughtAt) {
      userBook.boughtAt = createUserBookDto.boughtAt;
    }
    
    if (createUserBookDto.userNotes) {
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
   * Find all user books
   */
  async findAllUserBooks(userId: string): Promise<UserBook[]> {
    return this.userBookRepository.findByUserId(userId);
  }

  /**
   * Find user book by ID
   */
  async findUserBookById(id: string, userId: string): Promise<UserBook> {
    const userBook = await this.userBookRepository.findByIdAndUserId(id, userId);
    if (!userBook) {
      throw new NotFoundException(`User book with ID ${id} not found`);
    }
    return userBook;
  }

  /**
   * Find user books by status
   */
  async findUserBooksByStatus(status: BookStatus, userId: string): Promise<UserBook[]> {
    return this.userBookRepository.findByStatus(status, userId);
  }

  /**
   * Find completed user books in date range
   */
  async findCompletedUserBooks(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UserBook[]> {
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    return this.userBookRepository.findCompletedBetweenDates(userId, startDate, endDate);
  }

  /**
   * Update user book
   */
  async updateUserBook(
    id: string,
    updateUserBookDto: {
      status?: BookStatus;
      isPrivate?: boolean;
      rating?: number;
      boughtAt?: Date;
      userNotes?: string;
      currentPage?: number;
      rereadCount?: number;
      startedAt?: Date;
      finishedAt?: Date;
    },
    userId: string
  ): Promise<UserBook> {
    const userBook = await this.findUserBookById(id, userId);

    // Update fields if provided
    if (updateUserBookDto.status !== undefined) {
      userBook.status = updateUserBookDto.status;
      
      // Set startedAt date if reading for the first time
      if (updateUserBookDto.status === BookStatus.READING && !userBook.startedAt) {
        userBook.startedAt = new Date();
      }
      
      // Set finishedAt date if completed
      if (updateUserBookDto.status === BookStatus.COMPLETED && !userBook.finishedAt) {
        userBook.finishedAt = new Date();
      }
    }
    
    if (updateUserBookDto.isPrivate !== undefined) {
      userBook.isPrivate = updateUserBookDto.isPrivate;
    }
    
    if (updateUserBookDto.rating !== undefined) {
      userBook.rating = updateUserBookDto.rating;
    }
    
    if (updateUserBookDto.boughtAt !== undefined) {
      userBook.boughtAt = updateUserBookDto.boughtAt;
    }
    
    if (updateUserBookDto.userNotes !== undefined) {
      userBook.userNotes = updateUserBookDto.userNotes;
    }
    
    if (updateUserBookDto.currentPage !== undefined) {
      userBook.currentPage = updateUserBookDto.currentPage;
    }
    
    if (updateUserBookDto.rereadCount !== undefined) {
      userBook.rereadCount = updateUserBookDto.rereadCount;
    }
    
    if (updateUserBookDto.startedAt !== undefined) {
      userBook.startedAt = updateUserBookDto.startedAt;
    }
    
    if (updateUserBookDto.finishedAt !== undefined) {
      userBook.finishedAt = updateUserBookDto.finishedAt;
    }

    await this.userBookRepository.persistAndFlush(userBook);
    return userBook;
  }

  /**
   * Update user book status
   */
  async updateUserBookStatus(
    id: string,
    status: BookStatus,
    userId: string
  ): Promise<UserBook> {
    const userBook = await this.findUserBookById(id, userId);
    
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
   * Delete user book
   */
  async deleteUserBook(id: string, userId: string): Promise<boolean> {
    const userBook = await this.findUserBookById(id, userId);
    
    // Delete user book
    await this.userBookRepository.getEntityManager().removeAndFlush(userBook);
    return true;
  }
} 