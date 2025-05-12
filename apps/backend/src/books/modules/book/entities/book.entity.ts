import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { UserBook } from "./user-book.entity";


@Entity()
export class Book {
  @PrimaryKey()
  id: string = v4();

  @Property()
  title: string;

  @Property({ nullable: true })
  subTitle?: string;

  @Property({ nullable: true })
  externalId?: string;

  @Property({ nullable: true })
  author?: string;

  @Property({ nullable: true })
  isbn?: string;

  @Property({ nullable: true })
  coverUrl?: string;

  @Property({ nullable: true, type: "text" })
  description?: string;

  @Property({ nullable: true })
  publishedDate?: Date;

  @Property({ nullable: true })
  publisher?: string;
  
  @Property({ nullable: true })
  pageCount?: number;

  @Property({ nullable: true, columnType: 'decimal(10,2)' })
  price?: number;

  @Property({ nullable: true, columnType: 'decimal(10,2)' })
  discount?: number;

  @Property({ nullable: true })
  language?: string;

  @Property({ type: "json", nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => UserBook, (userBook) => userBook.book)
  userBooks = new Collection<UserBook>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
