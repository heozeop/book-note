import { Field, ID, ObjectType } from "@nestjs/graphql";
import { NoteType } from "./note.type";
import { StrokeType } from "./stroke.type";

@ObjectType('Thought')
export class ThoughtType {
  @Field(() => ID)
  id: string;

  @Field(() => NoteType)
  note: NoteType;

  @Field(() => ThoughtType, { nullable: true })
  parentThought?: ThoughtType;

  @Field(() => [ThoughtType], { nullable: true })
  childThoughts?: ThoughtType[];

  @Field({ nullable: true })
  text?: string;

  @Field()
  orderIndex: number;

  @Field()
  depth: number;

  @Field()
  inputType: string;

  @Field(() => [StrokeType], { nullable: true })
  strokes?: StrokeType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 