import { User, UserRole } from "@/auth/entities/user.entity";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType('User')
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
