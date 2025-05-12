import { BaseRepository } from "@/common/repositories/base.repository";
import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { PageNoteTag } from "../entities/page-note-tag.entity";

@Injectable()
export class PageNoteTagRepository extends BaseRepository<PageNoteTag> {
  constructor(protected readonly em: EntityManager) {
    super(em, "PageNoteTag");
  }

  /**
   * Find tags for a specific page note
   * @param pageNoteId Page note ID
   * @returns PageNoteTag array
   */
  async findByPageNoteId(pageNoteId: string): Promise<PageNoteTag[]> {
    return this.find({ pageNote: { id: pageNoteId } }, { populate: ['tag'] });
  }

  async findByTagId(tagId: string): Promise<PageNoteTag[]> {
    return this.find({ tag: tagId }, { populate: ['pageNote'] });
  }

  async findPageNotesByTagId(tagId: string): Promise<string[]> {
    const pageNoteTags = await this.findByTagId(tagId);
    return pageNoteTags.map(pnt => pnt.pageNote.id);
  }
} 