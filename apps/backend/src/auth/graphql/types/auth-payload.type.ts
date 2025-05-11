import { AuthTokens } from "@/auth/graphql/types/auth-tokens.type";
import { UserType } from "@/auth/graphql/types/user.type";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType('AuthPayload')
export class AuthPayload {
  @Field(() => UserType)
  user: UserType;

  @Field(() => AuthTokens)
  tokens: AuthTokens;
}
