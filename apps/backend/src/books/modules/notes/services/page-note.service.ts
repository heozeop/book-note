import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePageNoteDto } from "../../../dtos/create-page-note.dto";
import { UpdatePageNoteDto } from "../../../dtos/update-page-note.dto";
import { UserBookRepository } from "../../book/repositories/user-book.repository";
import { PageNote } from "../entities/page-note.entity";
import { PageNoteRepository, QuoteRepository, ReactionRepository, StrokeRepository, ThoughtRepository } from "../repositories";

@Injectable()
export class PageNoteService {
  constructor(
    private readonly pageNoteRepository: PageNoteRepository,
    private readonly quoteRepository: QuoteRepository,
    private readonly thoughtRepository: ThoughtRepository,
    private readonly strokeRepository: StrokeRepository,
    private readonly reactionRepository: ReactionRepository,
    private readonly userBookRepository: UserBookRepository
  ) {}

  /**
   * Find all notes for a user's book
   * @param userId User ID
   * @param bookId Book ID
   * @returns PageNoteResponseDto array
   */
  async findByUserAndBook(userId: string, bookId: string): Promise<PageNote[]> {
    return await this.pageNoteRepository.findByUserAndBook(userId, bookId);
  }

  /**
   * Find a note by ID and verify user ownership
   * @param id Note ID
   * @param userId User ID
   * @returns PageNoteResponseDto or null
   */
  async findByIdAndUser(id: string, userId: string): Promise<PageNote | null> {
    return await this.pageNoteRepository.findByIdAndUser(id, userId);
  }

  /**
   * Find all notes for a user book
   * @param userBookId User book ID
   * @returns PageNoteResponseDto array
   */
  async findAllByUserBookId(userBookId: string): Promise<PageNote[]> {
    return await this.pageNoteRepository.find({ userBook: userBookId });
  }

  /**
   * Find a note by ID
   * @param id Note ID
   * @param userBookId User book ID
   * @returns PageNoteResponseDto or null
   */
  async findById(id: string, userBookId: string): Promise<PageNote | null> {
    return await this.pageNoteRepository.findOne({ id, userBook: userBookId });
  }

  /**
   * Create a new page note
   * @param createPageNoteDto Create page note data
   * @param userId User ID
   * @returns PageNoteResponseDto
   */
  async create(createPageNoteDto: CreatePageNoteDto, userId: string): Promise<PageNote> {
    // Validate that the user has access to the userBook first
    const userBook = await this.userBookRepository.findByIdAndUserId(createPageNoteDto.userBookId, userId);
    if (!userBook) {
      throw new NotFoundException(`UserBook with ID ${createPageNoteDto.userBookId} not found or you don't have access`);
    }

    // Create the page note
    const pageNote = new PageNote();
    pageNote.page = createPageNoteDto.page;
    pageNote.userBook = userBook;
    
    // Set content if available in DTO
    if (createPageNoteDto.content) {
      pageNote.title = createPageNoteDto.content;
    }

    // Persist and flush the entity
    await this.pageNoteRepository.persistAndFlush(pageNote);
    return pageNote;
  }

  /**
   * Update an existing page note
   * @param id Note ID
   * @param updatePageNoteDto Update page note data
   * @param userBookId User book ID
   * @returns PageNoteResponseDto or null
   */
  async update(id: string, updatePageNoteDto: UpdatePageNoteDto, userBookId: string): Promise<PageNote | null> {
    // Find the page note
    const pageNote = await this.pageNoteRepository.findOne({ id, userBook: userBookId });
    if (!pageNote) {
      return null;
    }

    // Update the fields
    if (updatePageNoteDto.page !== undefined) {
      pageNote.page = updatePageNoteDto.page;
    }

    // Update content if provided (store in title field)
    if (updatePageNoteDto.content !== undefined) {
      pageNote.title = updatePageNoteDto.content;
    }

    // Persist and flush the entity
    await this.pageNoteRepository.persistAndFlush(pageNote);
    return pageNote;
  }

  /**
   * Delete a page note
   * @param id Note ID
   * @param userBookId User book ID
   * @returns true if deleted, false otherwise
   */
  async delete(id: string, userBookId: string): Promise<boolean> {
    // Find the page note
    const pageNote = await this.pageNoteRepository.findOne({ id, userBook: userBookId });
    if (!pageNote) {
      return false;
    }

    // Delete related entities using existing repository methods
    const quotes = await this.quoteRepository.findByPageNoteId(id);
    for (const quote of quotes) {
      this.pageNoteRepository.getEntityManager().remove(quote);
    }

    const thoughts = await this.thoughtRepository.findByPageNoteId(id);
    for (const thought of thoughts) {
      this.pageNoteRepository.getEntityManager().remove(thought);
    }

    // Remove the page note
    this.pageNoteRepository.getEntityManager().remove(pageNote);
    
    // Flush all changes
    await this.pageNoteRepository.getEntityManager().flush();
    
    return true;
  }

  /**
   * Validate that a user has access to a user book
   * @param userBookId User book ID
   * @param userId User ID
   * @returns true if user has access, false otherwise
   */
  async validateUserBookAccess(userBookId: string, userId: string): Promise<boolean> {
    const userBook = await this.userBookRepository.findByIdAndUserId(userBookId, userId);
    return !!userBook;
  }
} 