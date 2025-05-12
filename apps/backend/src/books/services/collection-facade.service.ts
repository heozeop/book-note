import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../auth/entities/user.entity';
import {
  BookResponseDto,
  CollectionResponseDto,
  CreateCollectionDto,
  UpdateCollectionDto
} from '../dtos';
import { BookService } from '../modules/book/services/book.service';
import { CollectionService } from '../modules/collections/services/collection.service';
import { TagService } from '../modules/tags/services/tag.service';
@Injectable()
export class CollectionFacadeService {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly bookService: BookService,
    private readonly tagService: TagService,
  ) {}

  /**
   * Create a new collection
   */
  async createCollection(
    createCollectionDto: CreateCollectionDto, 
    user: User
  ): Promise<CollectionResponseDto> {
    const collection = await this.collectionService.createCollection(
      createCollectionDto, 
      user
    );

    const books = await this.collectionService.getBooksFromCollection(collection.id, user.id);
    const tags = await this.tagService.getTagsForUserBooks(books.map(book => book.id));

    return CollectionResponseDto.fromEntity(collection, books.map(book => BookResponseDto.fromEntity(book, tags[book.id])));
  }

  /**
   * Find all collections for a user
   */
  async findAllByUserId(userId: string): Promise<CollectionResponseDto[]> {
    const collections = await this.collectionService.findAllByUserId(userId);
    const collectionIds = collections.map(collection => collection.id);
    const books = await this.collectionService.getBooksFromCollections(collectionIds, userId);
    
    // Get unique book IDs across all collections
    const bookIds = [...new Set(Object.values(books).flat().map(book => book.id))];
    const tags = await this.tagService.getTagsForUserBooks(bookIds);

    return collections.map(collection => {
      const collectionBooks = books[collection.id] || [];
      const bookDtos = collectionBooks.map(book => 
        BookResponseDto.fromEntity(book, tags[book.id])
      );

      return CollectionResponseDto.fromEntity(collection, bookDtos);
    });
  }

  /**
   * Find a collection by ID
   */
  async findById(
    id: string, 
    userId: string
  ): Promise<CollectionResponseDto> {
    const collection = await this.collectionService.findById(id, userId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    const books = await this.collectionService.getBooksFromCollection(collection.id, userId);
    const tags = await this.tagService.getTagsForUserBooks(books.map(book => book.id));

    return CollectionResponseDto.fromEntity(collection, books.map(book => BookResponseDto.fromEntity(book, tags[book.id])));
  }

  /**
   * Update a collection
   */
  async updateCollection(
    id: string, 
    updateCollectionDto: UpdateCollectionDto, 
    userId: string
  ): Promise<CollectionResponseDto> {
    const updatedCollection = await this.collectionService.updateCollection(
      id, 
      updateCollectionDto, 
      userId
    );

    const books = await this.collectionService.getBooksFromCollection(updatedCollection.id, userId);
    const tags = await this.tagService.getTagsForUserBooks(books.map(book => book.id));

    return CollectionResponseDto.fromEntity(updatedCollection, books.map(book => BookResponseDto.fromEntity(book, tags[book.id])));
  }

  /**
   * Delete a collection
   */
  async deleteCollection(id: string, userId: string): Promise<boolean> {
    return this.collectionService.deleteCollection(id, userId);
  }

  /**
   * Add a book to a collection
   */
  async addBookToCollection(
    collectionId: string, 
    bookId: string, 
    userId: string
  ): Promise<void> {
    await this.collectionService.addBookToCollection(collectionId, bookId, userId);
  }

  /**
   * Remove a book from a collection
   */
  async removeBookFromCollection(
    collectionId: string, 
    bookId: string, 
    userId: string
  ): Promise<void> {
    await this.collectionService.removeBookFromCollection(collectionId, bookId, userId);
  }

  /**
   * Get books from a collection
   */
  async getBooksFromCollection(collectionId: string, userId: string): Promise<BookResponseDto[]> {
    // Fetch all books in a single efficient query
    const books = await this.collectionService.getBooksFromCollection(collectionId, userId);
    const tags = await this.tagService.getTagsForUserBooks(books.map(book => book.id));
    
    // Map the Book entities directly to DTOs
    return books.map(book => BookResponseDto.fromEntity(book, tags[book.id]));
  }
} 