import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { PageNote } from "./page-note.entity";
import { Thought } from "./thought.entity";

@Entity()
export class Quote {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => PageNote)
  pageNote: PageNote;

  @Property({ columnType: "text" })
  text: string;

  @Property()
  orderIndex: number = 0;

  @OneToMany(() => Thought, thought => thought.quote)
  thoughts = new Collection<Thought>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 