import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../entities/user.entity';

// Register UserRole enum with GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The role of the user',
});

@ObjectType()
export class UserType {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  displayName: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field({ nullable: true })
  profileImage?: string;

  @Field()
  isVerified: boolean;

  @Field()
  createdAt: Date;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  profileImage?: string;

  @Field({ nullable: true })
  timezone?: string;
}

@ObjectType()
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

@ObjectType()
export class AuthPayload {
  @Field(() => UserType)
  user: UserType;

  @Field(() => AuthTokens)
  tokens: AuthTokens;
} 