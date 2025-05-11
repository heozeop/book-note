import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateThoughtDto, InputType } from "../dtos/create-thought.dto";
import { Stroke } from "../entities/stroke.entity";
import { Thought } from "../entities/thought.entity";
import { NoteRepository } from "../repositories/note.repository";
import { StrokeRepository } from "../repositories/stroke.repository";
import { ThoughtRepository } from "../repositories/thought.repository";

@Injectable()
export class ThoughtService {
  constructor(
    private readonly thoughtRepository: ThoughtRepository,
    private readonly noteRepository: NoteRepository,
    private readonly strokeRepository: StrokeRepository,
  ) {}

  /**
   * Create a new thought with either text or stroke data
   */
  async createThought(createThoughtDto: CreateThoughtDto): Promise<Thought> {
    const { noteId, parentThoughtId, text, strokeData, inputType } =
      createThoughtDto;

    // Find the note
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    // Check parent thought if specified
    let parentThought: Thought | null = null;
    if (parentThoughtId) {
      parentThought = await this.thoughtRepository.findById(parentThoughtId);
      if (!parentThought) {
        throw new NotFoundException(
          `Parent thought with ID ${parentThoughtId} not found`,
        );
      }
    }

    // Validate input based on type
    if (inputType === InputType.TEXT && !text) {
      throw new BadRequestException("Text input requires text content");
    } else if (inputType === InputType.STROKE && !strokeData) {
      throw new BadRequestException("Stroke input requires stroke data");
    }

    // Create the thought entity
    const thought = new Thought();
    thought.note = note;
    thought.orderIndex = createThoughtDto.orderIndex;
    thought.depth = createThoughtDto.depth;
    thought.inputType = inputType;

    // Set parent thought if specified
    if (parentThought) {
      thought.parentThought = parentThought;
      // Increment depth from parent
      thought.depth = Math.min(parentThought.depth + 1, 3);
    }

    // Set text content if it's text input
    if (inputType === InputType.TEXT) {
      thought.text = text;
    }

    // Save the thought
    await this.thoughtRepository.persistAndFlush(thought);

    // If it's stroke input, create and save the stroke data
    if (inputType === InputType.STROKE && strokeData) {
      const stroke = new Stroke();
      stroke.thought = thought;
      stroke.strokeData = strokeData;
      stroke.sourceType = "MOBILE";
      await this.strokeRepository.persistAndFlush(stroke);
    }

    return thought;
  }

  /**
   * Get a thought by ID
   */
  async getThoughtById(id: string): Promise<Thought> {
    const thought = await this.thoughtRepository.findById(id);
    if (!thought) {
      throw new NotFoundException(`Thought with ID ${id} not found`);
    }
    return thought;
  }

  /**
   * Get all thoughts for a note
   */
  async getThoughtsByNoteId(noteId: string): Promise<Thought[]> {
    return this.thoughtRepository.findByNoteId(noteId);
  }

  /**
   * Get all child thoughts for a parent thought
   */
  async getChildThoughts(parentThoughtId: string): Promise<Thought[]> {
    return this.thoughtRepository.findChildThoughts(parentThoughtId);
  }

  /**
   * Update a thought
   */
  async updateThought(
    id: string,
    updateData: Partial<{
      text: string;
      orderIndex: number;
      strokeData: string;
    }>,
  ): Promise<Thought> {
    const thought = await this.thoughtRepository.findById(id);
    if (!thought) {
      throw new NotFoundException(`Thought with ID ${id} not found`);
    }

    // Update basic thought properties
    if (updateData.text !== undefined) {
      thought.text = updateData.text;
    }

    if (updateData.orderIndex !== undefined) {
      thought.orderIndex = updateData.orderIndex;
    }

    // If stroke data is provided and it's a stroke input type thought
    if (updateData.strokeData && thought.inputType === InputType.STROKE) {
      // Find existing stroke or create new one
      let stroke = (await this.strokeRepository.findByThoughtId(id))[0];

      if (stroke) {
        // Update existing stroke
        stroke.strokeData = updateData.strokeData;
        await this.strokeRepository.persistAndFlush(stroke);
      } else {
        // Create new stroke
        stroke = new Stroke();
        stroke.thought = thought;
        stroke.strokeData = updateData.strokeData;
        stroke.sourceType = "MOBILE";
        await this.strokeRepository.persistAndFlush(stroke);
      }
    }

    await this.thoughtRepository.persistAndFlush(thought);
    return thought;
  }

  /**
   * Delete a thought and its child thoughts
   */
  async deleteThought(id: string): Promise<void> {
    const thought = await this.thoughtRepository.findById(id);
    if (!thought) {
      throw new NotFoundException(`Thought with ID ${id} not found`);
    }

    // Delete associated strokes first
    await this.strokeRepository.deleteByThoughtId(id);

    // Delete thought and all its children
    await this.thoughtRepository.deleteThoughtWithChildren(id);
  }
}
