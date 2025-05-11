import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../../auth/entities/user.entity";
import { CollectionBookResponseDto } from "../dtos/collection-book.response.dto";
import { CreateCollectionDto } from "../dtos/create-collection.dto";
import { UpdateCollectionDto } from "../dtos/update-collection.dto";
import { Collection } from "../entities/collection.entity";
import { BookCollectionRepository } from "../repositories/book-collection.repository";
import { BookRepository } from "../repositories/book.repository";
import { CollectionRepository } from "../repositories/collection.repository";

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly bookRepository: BookRepository,
    private readonly bookCollectionRepository: BookCollectionRepository
  ) {}

  /**
   * 새 컬렉션을 생성합니다.
   */
  async createCollection(
    createCollectionDto: CreateCollectionDto, 
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
   * 사용자의 모든 컬렉션을 조회합니다.
   */
  async findAllByUserId(userId: string): Promise<Collection[]> {
    return this.collectionRepository.findByOwnerId(userId);
  }

  /**
   * ID로 컬렉션을 조회합니다.
   */
  async findById(id: string, userId: string): Promise<Collection | null> {
    return this.collectionRepository.findByIdAndOwnerId(id, userId);
  }

  /**
   * 컬렉션을 업데이트합니다.
   */
  async updateCollection(
    id: string, 
    updateCollectionDto: UpdateCollectionDto, 
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
   * 컬렉션을 삭제합니다.
   */
  async deleteCollection(id: string, userId: string): Promise<void> {
    const collection = await this.findById(id, userId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    // 컬렉션에 속한 모든 BookCollection 관계 삭제
    await this.bookCollectionRepository.getEntityManager().nativeDelete('BookCollection', { collection: id });

    // 컬렉션 삭제
    await this.collectionRepository.getEntityManager().removeAndFlush(collection);
  }

  /**
   * 컬렉션에 책을 추가합니다.
   */
  async addBookToCollection(
    collectionId: string, 
    bookId: string, 
    userId: string
  ): Promise<void> {
    // 컬렉션이 존재하고 사용자의 것인지 확인
    const collection = await this.findById(collectionId, userId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    // 책이 존재하는지 확인
    const book = await this.bookRepository.findOne(bookId);
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // 이미 컬렉션에 책이 있는지 확인
    const existingRelation = await this.bookCollectionRepository.findByBookIdAndCollectionId(
      bookId, 
      collectionId
    );

    if (existingRelation) {
      return; // 이미 존재하면 아무것도 하지 않음
    }

    // 책과 컬렉션 관계 생성
    const bookCollection = this.bookCollectionRepository.create({
      book,
      collection,
      addedAt: new Date()
    });
    
    await this.bookCollectionRepository.persistAndFlush(bookCollection);
  }

  /**
   * 컬렉션에서 책을 제거합니다.
   */
  async removeBookFromCollection(
    collectionId: string, 
    bookId: string, 
    userId: string
  ): Promise<void> {
    // 컬렉션이 존재하고 사용자의 것인지 확인
    const collection = await this.findById(collectionId, userId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    // 책이 컬렉션에 있는지 확인
    const relation = await this.bookCollectionRepository.findByBookIdAndCollectionId(
      bookId, 
      collectionId
    );

    if (!relation) {
      throw new NotFoundException(`Book with ID ${bookId} not found in collection`);
    }

    // 관계 삭제
    await this.bookCollectionRepository.getEntityManager().removeAndFlush(relation);
  }

  /**
   * 컬렉션의 모든 책을 조회합니다.
   */
  async getBooksFromCollection(collectionId: string, userId: string) {
    // 컬렉션이 존재하고 사용자의 것인지 확인
    const collection = await this.findById(collectionId, userId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    // Get book collections
    const bookCollections = await this.bookCollectionRepository.findByCollectionId(collectionId);
    
    // Transform to response DTOs that match the expected format in e2e tests
    return bookCollections
      .map(bookCollection => CollectionBookResponseDto.fromBookCollection(bookCollection))
      .filter(dto => dto !== null); // Filter out any null values
  }
} 