import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "../../auth/entities/user.entity";
import { Note } from "../../notes/entities/note.entity";
import { BookCollection } from "./book-collection.entity";

export enum BookStatus {
  WANT_TO_READ = "want_to_read",
  READING = "reading",
  COMPLETED = "completed",
  DNF = "dnf", // Did Not Finish
}
@Entity()
export class Book {
  @PrimaryKey()
  id: string = v4();

  @Property()
  title: string;

  @Property({ nullable: true })
  author?: string;

  @Property({ nullable: true })
  isbn?: string;

  @Property({ nullable: true })
  coverImage?: string;

  @Property({ nullable: true, type: "text" })
  description?: string;

  @Property({ nullable: true })
  publishedDate?: Date;

  @Property({ nullable: true })
  publisher?: string;

  @Enum(() => BookStatus)
  status: BookStatus = BookStatus.WANT_TO_READ;

  @Property({ nullable: true })
  currentPage?: number;

  @Property({ nullable: true })
  totalPages?: number;

  @Property({ nullable: true })
  startedAt?: Date;

  @Property({ nullable: true })
  finishedAt?: Date;

  @Property({ type: "json", nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User)
  owner: User;

  @OneToMany(() => Note, (note) => note.book, { eager: false })
  notes = new Collection<Note>(this);

  @OneToMany(() => BookCollection, (bookCollection) => bookCollection.book)
  bookCollections = new Collection<BookCollection>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
