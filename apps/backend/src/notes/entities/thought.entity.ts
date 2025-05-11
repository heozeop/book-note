import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { Note } from "./note.entity";
import { Stroke } from "./stroke.entity";

@Entity()
export class Thought {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => Note)
  note: Note;

  @ManyToOne(() => Thought, { nullable: true })
  parentThought?: Thought;

  @OneToMany(() => Thought, (thought) => thought.parentThought, { eager: false })
  childThoughts = new Collection<Thought>(this);

  @Property({ type: "text", nullable: true })
  text?: string; // Text content for web input

  @Property()
  orderIndex: number = 0;

  @Property()
  depth: number = 0; // 0 = root, 1-3 for nested thoughts

  @Property()
  inputType: string = 'TEXT'; // TEXT or STROKE

  @OneToMany(() => Stroke, (stroke) => stroke.thought, { eager: false })
  strokes = new Collection<Stroke>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 