import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../../../../auth/entities/user.entity";
import { Book } from "../../book/entities/book.entity";
import { BookCollection } from "../entities/book-collection.entity";
import { Collection } from "../entities/collection.entity";
import { BookCollectionRepository } from "../repositories/book-collection.repository";
import { CollectionRepository } from "../repositories/collection.repository";

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly bookCollectionRepository: BookCollectionRepository
  ) {}

  /**
   * Create a new collection
   */
  async createCollection(
    createCollectionDto: {
      name: string;
      description?: string;
    }, 
    user: User
  ): Promise<Collection> {
    const collection = new Collection();
    collection.name = createCollectionDto.name;
    collection.description = createCollectionDto.description;
    collection.owner = user;

    await this.collectionRepository.persistAndFlush(collection);
    return collection;
  }

  /**
   * Find all collections for a user
   */
  async findAllByUserId(userId: string): Promise<Collection[]> {
    return this.collectionRepository.findByOwnerId(userId);
  }

  /**
   * Find a collection by ID
   */
  async findById(id: string, userId: string): Promise<Collection | null> {
    return this.collectionRepository.findByIdAndOwnerId(id, userId);
  }

  /**
   * Update a collection
   */
  async updateCollection(
    id: string, 
    updateCollectionDto: {
      name?: string;
      description?: string;
    }, 
    userId: string
  ): Promise<Collection> {
    const collection = await this.findById(id, userId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    if (updateCollectionDto.name) {
      collection.name = updateCollectionDto.name;
    }

    if (updateCollectionDto.description !== undefined) {
      collection.description = updateCollectionDto.description;
    }

    await this.collectionRepository.persistAndFlush(collection);
    return collection;
  }

  /**
   * Delete a collection
   */
  async deleteCollection(id: string, userId: string): Promise<boolean> {
    const collection = await this.findById(id, userId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    // Delete all BookCollection relationships
    await this.bookCollectionRepository.getEntityManager().nativeDelete('BookCollection', { collection: id });

    // Delete the collection
    await this.collectionRepository.getEntityManager().removeAndFlush(collection);
    return true;
  }

  /**
   * Add a book to a collection
   */
  async addBookToCollection(
    collectionId: string, 
    bookId: string, 
    userId: string
  ): Promise<void> {
    // Check if collection exists and belongs to user
    const collection = await this.findById(collectionId, userId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    // Check if book-collection relationship already exists
    const existingRelation = await this.bookCollectionRepository.findByBookIdAndCollectionId(
      bookId, 
      collectionId
    );

    if (existingRelation) {
      return; // Already exists, nothing to do
    }

    // Create book-collection relationship
    const bookCollection = new BookCollection();
    bookCollection.book = this.bookCollectionRepository.getEntityManager().getReference('Book', bookId) as Book;
    bookCollection.collection = collection;
    bookCollection.addedAt = new Date();
    
    await this.bookCollectionRepository.persistAndFlush(bookCollection);
  }

  /**
   * Remove a book from a collection
   */
  async removeBookFromCollection(
    collectionId: string, 
    bookId: string, 
    userId: string
  ): Promise<void> {
    // Check if collection exists and belongs to user
    const collection = await this.findById(collectionId, userId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    // Check if book is in collection
    const relation = await this.bookCollectionRepository.findByBookIdAndCollectionId(
      bookId, 
      collectionId
    );

    if (!relation) {
      throw new NotFoundException(`Book with ID ${bookId} not found in collection`);
    }

    // Remove relationship
    await this.bookCollectionRepository.getEntityManager().removeAndFlush(relation);
  }

  /**
   * Get all books in a collection
   */
  async getBooksFromCollection(collectionId: string, userId: string): Promise<Book[]> {
    // Get books directly with the optimized method
    return this.bookCollectionRepository.findBooksByCollectionId(collectionId, userId);
  }

  async getBooksFromCollections(collectionIds: string[], userId: string): Promise<Record<string, Book[]>> {
    return this.bookCollectionRepository.findBooksByCollectionIds(collectionIds, userId);
  }
} 