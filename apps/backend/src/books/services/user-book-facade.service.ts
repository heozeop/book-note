import { Injectable } from '@nestjs/common';
import { User } from '../../auth/entities/user.entity';
import {
    CreateUserBookDto,
    UpdateUserBookDto,
    UserBookResponseDto
} from '../dtos';
import { BookStatus } from '../modules/book/entities/reading-status.entity';
import { UserBookService } from '../modules/book/services/user-book.service';

@Injectable()
export class UserBookFacadeService {
  constructor(
    private readonly userBookService: UserBookService,
  ) {}

  /**
   * Create a user book
   */
  async createUserBook(
    createUserBookDto: CreateUserBookDto, 
    user: User
  ): Promise<UserBookResponseDto> {
    const userBook = await this.userBookService.createUserBook(
      createUserBookDto, 
      user
    );
    return UserBookResponseDto.fromEntity(userBook);
  }

  /**
   * Find all user books
   */
  async findAllUserBooks(userId: string): Promise<UserBookResponseDto[]> {
    const userBooks = await this.userBookService.findAllUserBooks(userId);
    return userBooks.map(userBook => UserBookResponseDto.fromEntity(userBook));
  }

  /**
   * Find user book by ID
   */
  async findUserBookById(
    id: string, 
    userId: string
  ): Promise<UserBookResponseDto> {
    const userBook = await this.userBookService.findUserBookById(id, userId);
    return UserBookResponseDto.fromEntity(userBook);
  }

  /**
   * Find user books by status
   */
  async findUserBooksByStatus(
    status: BookStatus, 
    userId: string
  ): Promise<UserBookResponseDto[]> {
    const userBooks = await this.userBookService.findUserBooksByStatus(
      status, 
      userId
    );
    return userBooks.map(userBook => UserBookResponseDto.fromEntity(userBook));
  }

  /**
   * Find completed user books in date range
   */
  async findCompletedUserBooks(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UserBookResponseDto[]> {
    const userBooks = await this.userBookService.findCompletedUserBooks(
      userId, 
      startDate, 
      endDate
    );
    return userBooks.map(userBook => UserBookResponseDto.fromEntity(userBook));
  }

  /**
   * Update user book
   */
  async updateUserBook(
    id: string,
    updateUserBookDto: UpdateUserBookDto,
    userId: string
  ): Promise<UserBookResponseDto> {
    const userBook = await this.userBookService.updateUserBook(
      id, 
      updateUserBookDto, 
      userId
    );
    return UserBookResponseDto.fromEntity(userBook);
  }

  /**
   * Update user book status
   */
  async updateUserBookStatus(
    id: string,
    status: BookStatus,
    userId: string
  ): Promise<UserBookResponseDto> {
    const userBook = await this.userBookService.updateUserBookStatus(
      id, 
      status, 
      userId
    );
    return UserBookResponseDto.fromEntity(userBook);
  }

  /**
   * Delete user book
   */
  async deleteUserBook(id: string, userId: string): Promise<boolean> {
    return this.userBookService.deleteUserBook(id, userId);
  }
} 