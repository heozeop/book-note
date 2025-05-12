import { Injectable, NotFoundException } from "@nestjs/common";
import { Book } from "../../book/entities/book.entity";
import { Tag } from "../entities/tag.entity";
import { BookTagRepository } from "../repositories/book-tag.repository";
import { TagRepository } from "../repositories/tag.repository";

@Injectable()
export class TagService {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly bookTagRepository: BookTagRepository
  ) {}

  /**
   * Get all tags for a user
   */
  async findAllByUserId(userId: string): Promise<Tag[]> {
    return this.tagRepository.findByUserId(userId);
  }

  /**
   * Find or create a tag
   */
  async findOrCreateTag(tagName: string, userId: string): Promise<Tag> {
    // Check if tag already exists
    let tag = await this.tagRepository.findByNameAndUserId(tagName, userId);
    
    // Create if it doesn't exist
    if (!tag) {
      tag = new Tag();
      tag.name = tagName;
      tag.userId = userId;
      await this.tagRepository.persistAndFlush(tag);
    }
    
    return tag;
  }

  /**
   * Create tag-book relationship
   */
  async createBookTag(userBookId: string, tagId: string): Promise<void> {
    // Check if relationship already exists
    const existingBookTags = await this.bookTagRepository.find({
      userBook: userBookId,
      tag: tagId
    });
    
    // Create if it doesn't exist
    if (!existingBookTags || existingBookTags.length === 0) {
      // We need to load the entities properly to follow the entities relation constraints
      const userBookRef = this.bookTagRepository.getEntityManager().getReference('UserBook', userBookId);
      const tagRef = this.bookTagRepository.getEntityManager().getReference('Tag', tagId);
      
      // The repository method expects UserBook and Tag objects
      const bookTag = await this.bookTagRepository.createBookTag(
        userBookRef as any, 
        tagRef as any
      );
    }
  }

  /**
   * Get all tags for a user book
   */
  async getTagsForUserBook(userBookId: string): Promise<Tag[]> {
    return this.bookTagRepository.findTagsByUserBook(userBookId);
  }

  /**
   * Get all user books with a specific tag
   */
  async getUserBooksByTagId(tagId: string): Promise<string[]> {
    const userBooks = await this.bookTagRepository.findUserBooksByTag(tagId);
    return userBooks.map(userBook => userBook.id);
  }

  /**
   * Remove a tag from a user book
   */
  async removeTagFromUserBook(userBookId: string, tagId: string): Promise<void> {
    await this.bookTagRepository.removeBookTag(userBookId, tagId);
  }

  /**
   * Remove all tags from a user book
   */
  async removeAllTagsFromUserBook(userBookId: string): Promise<void> {
    await this.bookTagRepository.removeAllTagsFromUserBook(userBookId);
  }
  
  /**
   * Add multiple tags to a book efficiently
   */
  async addTagsToBook(userBookId: string, tagNames: string[], userId: string): Promise<void> {
    if (!tagNames.length) {
      return;
    }
    
    // Find or create all tags in a single transaction
    const tags = await Promise.all(
      tagNames.map(tagName => this.findOrCreateTag(tagName, userId))
    );
    
    // Create all book-tag relationships in parallel
    await Promise.all(
      tags.map(tag => this.createBookTag(userBookId, tag.id))
    );
  }
  
  /**
   * Remove a tag from a book by name
   */
  async removeTagFromBook(userBookId: string, tagName: string, userId: string): Promise<void> {
    // Find the tag
    const tag = await this.tagRepository.findByNameAndUserId(tagName, userId);
    if (!tag) {
      return; // Nothing to remove
    }
    
    // Remove the relationship
    await this.removeTagFromUserBook(userBookId, tag.id);
  }
  
  /**
   * Find books by tag name
   */
  async findBooksByTag(tagName: string, userId: string): Promise<Book[]> {
    // Find the tag
    const tag = await this.tagRepository.findByNameAndUserId(tagName, userId);
    if (!tag) {
      throw new NotFoundException(`Tag ${tagName} not found`);
    }
    
    // Get all user books with this tag
    const userBooks = await this.bookTagRepository.findUserBooksByTag(tag.id);
    return userBooks.map(userBook => userBook.book);
  }

  /**
   * Get tags for multiple user books at once
   */
  async getTagsForUserBooks(userBookIds: string[]): Promise<Record<string, Tag[]>> {
    return this.bookTagRepository.findTagsByUserBooks(userBookIds);
  }
} 