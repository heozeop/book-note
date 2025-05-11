import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Thought } from "./thought.entity";

@Entity()
export class Stroke {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => Thought)
  thought: Thought;

  @Property()
  strokeData: string; // JSON stringified stroke data

  @Property()
  sourceType: string = "MOBILE"; // Type of input source: 'MOBILE' or 'WEB'

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
