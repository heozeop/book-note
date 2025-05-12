import { User } from "@/auth/entities/user.entity";
import { Book } from "@/books/modules/book/entities/book.entity";
import { BookStatus, ReadingStatus } from "@/books/modules/book/entities/reading-status.entity";
import { PageNote } from "@/books/modules/notes/entities/page-note.entity";
import { BookTag } from "@/books/modules/tags/entities/book-tag.entity";
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

@Entity()
export class UserBook {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Book)
  book: Book;

  @Property({ default: true })
  isPrivate: boolean = true;

  @Property({ nullable: true, columnType: 'decimal(3,1)' })
  rating?: number;

  @Property({ nullable: true })
  boughtAt?: Date;
  
  @Property({ nullable: true, type: "text" })
  userNotes?: string;

  @Enum(() => BookStatus)
  status: BookStatus = BookStatus.WANT_TO_READ;

  @Property({ nullable: true })
  currentPage?: number;

  @Property({ default: 0 })
  rereadCount: number = 0;

  @Property({ nullable: true })
  startedAt?: Date;

  @Property({ nullable: true })
  finishedAt?: Date;

  @OneToMany(() => PageNote, (pageNote) => pageNote.userBook)
  pageNotes = new Collection<PageNote>(this);

  @OneToMany(() => ReadingStatus, (readingStatus) => readingStatus.userBook)
  readingStatuses = new Collection<ReadingStatus>(this);

  @OneToMany(() => BookTag, (bookTag) => bookTag.userBook)
  bookTags = new Collection<BookTag>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 