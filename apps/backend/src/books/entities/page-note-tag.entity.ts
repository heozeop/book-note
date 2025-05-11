import { Entity, ManyToOne, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { v4 } from "uuid";
import { PageNote } from "./page-note.entity";
import { Tag } from "./tag.entity";

@Entity()
@Unique({ properties: ['pageNote', 'tag'] })
export class PageNoteTag {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => PageNote)
  pageNote: PageNote;

  @ManyToOne(() => Tag)
  tag: Tag;

  @Property()
  addedAt: Date = new Date();
} 