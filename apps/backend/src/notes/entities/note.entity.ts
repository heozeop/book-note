import { User } from "@/auth/entities/user.entity";
import { Book } from "@/books/entities/book.entity";
import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Thought } from "./thought.entity";

@Entity()
export class Note {
  @PrimaryKey()
  id: string = v4();

  @Property({ type: "text" })
  content: string;

  @Property({ nullable: true })
  page?: number;

  @Property({ nullable: true })
  chapter?: string;

  @Property({ nullable: true })
  highlight?: string;

  @Property({ nullable: true, type: "text" })
  personalThoughts?: string;

  @Property({ type: "json", nullable: true })
  tags?: string[];

  @ManyToOne(() => Book)
  book: Book;

  @ManyToOne(() => User)
  author: User;

  @OneToMany(() => Thought, (thought) => thought.note, { eager: false })
  thoughts = new Collection<Thought>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
