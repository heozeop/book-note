import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";
import { InputType as ThoughtInputType } from "../../../notes/dtos/create-thought.dto";

@InputType()
export class CreateThoughtInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  noteId: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  parentThoughtId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  text?: string;

  @Field()
  @IsNumber()
  @Min(0)
  orderIndex: number = 0;

  @Field()
  @IsNumber()
  @Min(0)
  @Max(3)
  depth: number = 0;

  @Field()
  @IsEnum(ThoughtInputType)
  inputType: string = ThoughtInputType.TEXT;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  strokeData?: string; // JSON stringified stroke data
} 