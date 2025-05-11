import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ThoughtType } from "./thought.type";

@ObjectType("Stroke")
export class StrokeType {
  @Field(() => ID)
  id: string;

  @Field(() => ThoughtType)
  thought: ThoughtType;

  @Field()
  strokeData: string;

  @Field()
  sourceType: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
