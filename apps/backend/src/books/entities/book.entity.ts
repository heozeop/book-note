import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { v4 } from "uuid";
import { User } from "../../auth/entities/user.entity";
import { Note } from "../../notes/entities/note.entity";

export enum BookStatus {
  WANT_TO_READ = "want_to_read",
  READING = "reading",
  COMPLETED = "completed",
  DNF = "dnf", // Did Not Finish
}

// Register enum for GraphQL schema
registerEnumType(BookStatus, {
  name: "BookStatus",
  description: "Status of a book in the reading journey",
});

@Entity()
@ObjectType()
export class Book {
  @PrimaryKey()
  @Field(() => ID)
  id: string = v4();

  @Property()
  @Field()
  title: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  author?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  isbn?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  coverImage?: string;

  @Property({ nullable: true, type: "text" })
  @Field({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  publishedDate?: Date;

  @Property({ nullable: true })
  @Field({ nullable: true })
  publisher?: string;

  @Enum(() => BookStatus)
  @Field(() => BookStatus)
  status: BookStatus = BookStatus.WANT_TO_READ;

  @Property({ nullable: true })
  @Field({ nullable: true })
  currentPage?: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
  totalPages?: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
  startedAt?: Date;

  @Property({ nullable: true })
  @Field({ nullable: true })
  finishedAt?: Date;

  @Property({ type: "json", nullable: true })
  @Field(() => String, { nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User)
  @Field(() => User)
  owner: User;

  @OneToMany(() => Note, (note) => note.book, { eager: false })
  @Field(() => [Note], { nullable: true })
  notes = new Collection<Note>(this);

  @Property()
  @Field()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  @Field()
  updatedAt: Date = new Date();
}
