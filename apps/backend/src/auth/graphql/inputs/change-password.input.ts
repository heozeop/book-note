import { Field, InputType } from "@nestjs/graphql";

@InputType("ChangePasswordInput")
export class ChangePasswordInput {
  @Field()
  currentPassword: string;

  @Field()
  newPassword: string;
}
