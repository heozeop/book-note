import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { User } from "../../auth/entities/user.entity";
import { PageNote } from "./page-note.entity";

export enum ReactionType {
  LIKE = 'LIKE',
  HEART = 'HEART',
  INSIGHTFUL = 'INSIGHTFUL',
  CURIOUS = 'CURIOUS',
  CELEBRATE = 'CELEBRATE'
}

@Entity()
export class Reaction {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => PageNote)
  pageNote: PageNote;

  @Enum(() => ReactionType)
  type: ReactionType = ReactionType.LIKE;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 