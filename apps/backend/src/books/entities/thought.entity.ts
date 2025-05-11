import { Collection, Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { PageNote } from "./page-note.entity";
import { Quote } from "./quote.entity";
import { Stroke } from "./stroke.entity";

export enum InputType {
  TEXT = 'TEXT',
  STROKE = 'STROKE'
}

@Entity()
export class Thought {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => PageNote)
  pageNote: PageNote;

  @ManyToOne(() => Quote, { nullable: true })
  quote?: Quote;

  @ManyToOne(() => Thought, { nullable: true })
  parentThought?: Thought;

  @OneToMany(() => Thought, thought => thought.parentThought)
  childThoughts = new Collection<Thought>(this);

  @Property({ columnType: "text", nullable: true })
  text?: string;

  @Enum(() => InputType)
  inputType: InputType = InputType.TEXT;

  @Property()
  orderIndex: number = 0;

  @Property()
  depth: number = 0;

  @OneToMany(() => Stroke, stroke => stroke.thought)
  strokes = new Collection<Stroke>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 