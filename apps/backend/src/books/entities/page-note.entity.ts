import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { UserBook } from "./user-book.entity";
import { Quote } from "./quote.entity";
import { Thought } from "./thought.entity";

@Entity()
export class PageNote {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => UserBook)
  userBook: UserBook;

  @Property({ nullable: true })
  page?: number;

  @Property({ nullable: true })
  chapter?: string;

  @Property({ nullable: true })
  title?: string;

  @Property({ default: true })
  isPrivate: boolean = true;

  @OneToMany(() => Quote, quote => quote.pageNote)
  quotes = new Collection<Quote>(this);

  @OneToMany(() => Thought, thought => thought.pageNote)
  thoughts = new Collection<Thought>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 