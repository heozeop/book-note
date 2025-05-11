import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { Thought } from "../entities/thought.entity";

@Injectable()
export class ThoughtRepository extends BaseRepository<Thought> {
  constructor(protected readonly em: EntityManager) {
    super(em, "Thought");
  }

  /**
   * Find a thought by its ID
   */
  async findById(id: string): Promise<Thought | null> {
    return this.findOne({ id });
  }

  /**
   * Find all thoughts for a specific note
   */
  async findByNoteId(noteId: string): Promise<Thought[]> {
    return this.find({ note: noteId });
  }

  /**
   * Find all child thoughts for a parent thought
   */
  async findChildThoughts(parentThoughtId: string): Promise<Thought[]> {
    return this.find({ parentThought: parentThoughtId });
  }

  /**
   * Delete a thought and all its child thoughts
   */
  async deleteThoughtWithChildren(id: string): Promise<void> {
    // First find all child thoughts recursively
    const childrenToDelete = await this.findChildrenRecursively(id);
    
    // Delete children first
    for (const child of childrenToDelete) {
      await this.nativeDelete({ id: child.id });
    }
    
    // Then delete the parent thought
    await this.nativeDelete({ id });
  }

  /**
   * Helper method to find all children recursively
   */
  private async findChildrenRecursively(parentId: string): Promise<Thought[]> {
    const children = await this.find({ parentThought: parentId });
    let allDescendants = [...children];
    
    for (const child of children) {
      const descendants = await this.findChildrenRecursively(child.id);
      allDescendants = [...allDescendants, ...descendants];
    }
    
    return allDescendants;
  }
} 