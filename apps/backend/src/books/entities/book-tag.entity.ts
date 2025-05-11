import { Entity, ManyToOne, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Tag } from "./tag.entity";
import { UserBook } from "./user-book.entity";

@Entity()
@Unique({ properties: ['userBook', 'tag'] })
export class BookTag {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => UserBook)
  userBook: UserBook;

  @ManyToOne(() => Tag, { eager: true })
  tag: Tag;

  @Property()
  createdAt: Date = new Date();
} 