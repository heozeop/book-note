import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateCollectionInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
} 