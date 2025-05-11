import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateStrokeDto } from "../dtos/create-stroke.dto";
import { Stroke } from "../entities/stroke.entity";
import { StrokeRepository } from "../repositories/stroke.repository";
import { ThoughtRepository } from "../repositories/thought.repository";

@Injectable()
export class StrokeService {
  constructor(
    private readonly strokeRepository: StrokeRepository,
    private readonly thoughtRepository: ThoughtRepository
  ) {}

  /**
   * Create a new stroke
   */
  async createStroke(createStrokeDto: CreateStrokeDto): Promise<Stroke> {
    const { thoughtId, strokeData } = createStrokeDto;

    // Verify the thought exists
    const thought = await this.thoughtRepository.findById(thoughtId);
    if (!thought) {
      throw new NotFoundException(`Thought with ID ${thoughtId} not found`);
    }

    // Create stroke entity
    const stroke = new Stroke();
    stroke.thought = thought;
    stroke.strokeData = strokeData;
    stroke.sourceType = 'MOBILE';

    // Save to database
    await this.strokeRepository.persistAndFlush(stroke);
    return stroke;
  }

  /**
   * Get all strokes for a thought
   */
  async getStrokesByThoughtId(thoughtId: string): Promise<Stroke[]> {
    // Verify the thought exists
    const thought = await this.thoughtRepository.findById(thoughtId);
    if (!thought) {
      throw new NotFoundException(`Thought with ID ${thoughtId} not found`);
    }

    return this.strokeRepository.findByThoughtId(thoughtId);
  }

  /**
   * Get a stroke by ID
   */
  async getStrokeById(id: string): Promise<Stroke> {
    const stroke = await this.strokeRepository.findById(id);
    if (!stroke) {
      throw new NotFoundException(`Stroke with ID ${id} not found`);
    }
    return stroke;
  }

  /**
   * Update a stroke
   */
  async updateStroke(id: string, strokeData: string): Promise<Stroke> {
    const stroke = await this.strokeRepository.findById(id);
    if (!stroke) {
      throw new NotFoundException(`Stroke with ID ${id} not found`);
    }

    stroke.strokeData = strokeData;
    await this.strokeRepository.persistAndFlush(stroke);
    return stroke;
  }

  /**
   * Delete a stroke
   */
  async deleteStroke(id: string): Promise<void> {
    const stroke = await this.strokeRepository.findById(id);
    if (!stroke) {
      throw new NotFoundException(`Stroke with ID ${id} not found`);
    }

    await this.strokeRepository.nativeDelete({ id });
  }
} 