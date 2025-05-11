import { Field, InputType } from "@nestjs/graphql";

@InputType("UpdateProfileInput")
export class UpdateProfileInput {
  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  profileImage?: string;

  @Field({ nullable: true })
  timezone?: string;
}
