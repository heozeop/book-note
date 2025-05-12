import { Entity, ManyToOne, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { v4 } from "uuid";
import { UserBook } from "../../book/entities/user-book.entity";
import { Tag } from "./tag.entity";

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