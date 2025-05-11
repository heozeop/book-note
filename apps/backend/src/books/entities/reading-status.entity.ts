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
import { ReadingLog } from "./reading-log.entity";
import { UserBook } from "./user-book.entity";

export enum BookStatus {
  WANT_TO_READ = "want_to_read",
  READING = "reading",
  COMPLETED = "completed",
  DNF = "dnf", // Did Not Finish
}

@Entity()
export class ReadingStatus {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => UserBook)
  userBook: UserBook;

  @Enum(() => BookStatus)
  status: BookStatus = BookStatus.WANT_TO_READ;

  @Property({ nullable: true })
  currentPage?: number;

  @Property({ default: 0 })
  rereadCount: number = 0;

  @Property({ nullable: true })
  startedAt?: Date;

  @Property({ nullable: true })
  completedAt?: Date;

  @OneToMany(() => ReadingLog, (readingLog) => readingLog.readingStatus)
  readingLogs = new Collection<ReadingLog>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 