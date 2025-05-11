import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { Stroke } from "../entities/stroke.entity";

@Injectable()
export class StrokeRepository extends BaseRepository<Stroke> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Stroke");
  }

  /**
   * Find a stroke by its ID
   */
  async findById(id: string): Promise<Stroke | null> {
    return this.findOne({ id });
  }

  /**
   * Find all strokes for a specific thought
   */
  async findByThoughtId(thoughtId: string): Promise<Stroke[]> {
    return this.find({ thought: thoughtId });
  }

  /**
   * Delete all strokes for a thought
   */
  async deleteByThoughtId(thoughtId: string): Promise<void> {
    await this.nativeDelete({ thought: thoughtId });
  }
}
