import { BaseRepository } from "@/common/repositories/base.repository";
import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { Stroke } from "../entities/stroke.entity";

@Injectable()
export class StrokeRepository extends BaseRepository<Stroke> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Stroke");
  }

  async findByThoughtId(thoughtId: string): Promise<Stroke[]> {
    return this.find({ thought: thoughtId });
  }

  async findByIdAndThoughtId(id: string, thoughtId: string): Promise<Stroke | null> {
    return this.findOne({ id, thought: thoughtId });
  }
} 