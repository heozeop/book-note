import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "../../auth/entities/user.entity";
import { Book } from "./book.entity";
import { UserBook } from "./user-book.entity";

@Entity()
export class Note {
  @PrimaryKey()
  id: string = v4();

  @Property({ nullable: true })
  title?: string;

  @Property({ columnType: "text" })
  content: string;

  @Property({ nullable: true })
  page?: number;

  @Property({ default: false })
  isPublic: boolean = false;

  @ManyToOne(() => Book)
  book: Book;

  @ManyToOne(() => UserBook, { nullable: true })
  userBook?: UserBook;

  @ManyToOne(() => User)
  user: User;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}