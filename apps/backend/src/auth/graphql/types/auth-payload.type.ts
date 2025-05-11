import { Field, ObjectType } from "@nestjs/graphql";
import { AuthTokens } from "./auth-tokens.type";
import { UserType } from "./user.type";

@ObjectType("AuthPayload")
export class AuthPayload {
  @Field(() => UserType)
  user: UserType;

  @Field(() => AuthTokens)
  tokens: AuthTokens;
}
