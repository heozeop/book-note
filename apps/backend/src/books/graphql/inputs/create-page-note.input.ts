import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class CreatePageNoteInput {
  @Field(() => Int)
  @IsNumber()
  @Min(0)
  page: number;

  @Field()
  @IsString()
  content: string;

  @Field()
  @IsUUID()
  userBookId: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
} 