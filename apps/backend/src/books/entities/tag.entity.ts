import { Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { BookTag } from "./book-tag.entity";
import { PageNoteTag } from "./page-note-tag.entity";

@Entity()
export class Tag {
  @PrimaryKey()
  id: string = v4();

  @Property()
  name: string;

  @Property()
  userId: string;

  @OneToMany(() => BookTag, bookTag => bookTag.tag)
  bookTags = new Collection<BookTag>(this);

  @OneToMany(() => PageNoteTag, pageNoteTag => pageNoteTag.tag)
  pageNoteTags = new Collection<PageNoteTag>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 