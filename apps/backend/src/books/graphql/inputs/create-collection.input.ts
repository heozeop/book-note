import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCollectionInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  bookIds?: string[];
} 