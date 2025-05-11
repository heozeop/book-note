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
import { BookTag } from "./book-tag.entity";
import { Book } from "./book.entity";
import { PageNote } from "./page-note.entity";
import { BookStatus, ReadingStatus } from "./reading-status.entity";

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