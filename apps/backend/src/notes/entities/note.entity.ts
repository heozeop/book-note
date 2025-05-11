import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { v4 } from "uuid";
import { User } from "../../auth/entities/user.entity";
import { Book } from "../../books/entities/book.entity";

@Entity()
@ObjectType()
export class Note {
  @PrimaryKey()
  @Field(() => ID)
  id: string = v4();

  @Property({ type: "text" })
  @Field()
  content: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  page?: number;

  @Property({ nullable: true })
  @Field({ nullable: true })
  chapter?: string;

  @Property({ nullable: true })
  @Field({ nullable: true })
  highlight?: string;

  @Property({ nullable: true, type: "text" })
  @Field({ nullable: true })
  personalThoughts?: string;

  @Property({ type: "json", nullable: true })
  @Field(() => String, { nullable: true })
  tags?: string[];

  @ManyToOne(() => Book)
  @Field(() => Book)
  book: Book;

  @ManyToOne(() => User)
  @Field(() => User)
  author: User;

  @Property()
  @Field()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  @Field()
  updatedAt: Date = new Date();
}
