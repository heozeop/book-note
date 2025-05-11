import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User, UserRole } from '../entities/user.entity';

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

  /**
   * User 엔티티를 UserType으로 변환합니다.
   * @param user User 엔티티
   * @returns UserType 객체
   */
  static fromEntity(user: User): UserType {
    const userType = new UserType();
    userType.id = user.id;
    userType.email = user.email;
    userType.displayName = user.displayName;
    userType.role = user.role;
    userType.profileImage = user.profileImage;
    userType.isVerified = !!user.verifiedAt;
    userType.createdAt = user.createdAt;
    return userType;
  }
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

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  profileImage?: string;

  @Field({ nullable: true })
  timezone?: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  currentPassword: string;

  @Field()
  newPassword: string;
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