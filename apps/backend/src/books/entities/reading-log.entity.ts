import {
    Entity,
    ManyToOne,
    PrimaryKey,
    Property,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { ReadingStatus } from "./reading-status.entity";

@Entity()
export class ReadingLog {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => ReadingStatus)
  readingStatus: ReadingStatus;

  @Property()
  pageStart: number;

  @Property()
  pageEnd: number;

  @Property({ nullable: true })
  duration?: number;

  @Property({ nullable: true, type: "text" })
  notes?: string;

  @Property()
  createdAt: Date = new Date();
} 