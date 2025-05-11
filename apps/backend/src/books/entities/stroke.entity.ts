import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { Thought } from "./thought.entity";

export enum SourceType {
  MOBILE = 'MOBILE',
  WEB = 'WEB'
}

@Entity()
export class Stroke {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => Thought)
  thought: Thought;

  @Property({ columnType: "text" })
  strokeData: string;  // JSON string of stroke data

  @Enum(() => SourceType)
  sourceType: SourceType = SourceType.WEB;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
} 