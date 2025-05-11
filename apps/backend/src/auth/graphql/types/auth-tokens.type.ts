import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType("AuthTokens")
export class AuthTokens {
  @Field()
  accessToken: string;

  @Field({ nullable: true })
  refreshToken?: string;

  @Field()
  expiresIn: number;

  @Field()
  tokenType: string;
}
