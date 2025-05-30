import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Book } from "../../book/entities/book.entity";
import { Collection } from "./collection.entity";

@Entity()
export class BookCollection {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => Book)
  book: Book;

  @ManyToOne(() => Collection)
  collection: Collection;

  @Property()
  addedAt: Date = new Date();

  @Property({ nullable: true })
  order?: number;
} 