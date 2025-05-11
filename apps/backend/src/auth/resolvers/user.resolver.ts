import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { User } from "@/auth/entities/user.entity";
import { ChangePasswordInput } from "@/auth/graphql/inputs/change-password.input";
import { UpdateProfileInput } from "@/auth/graphql/inputs/update-profile.input";
import { UserType } from "@/auth/graphql/types/user.type";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthService } from "@/auth/services/auth.service";
import { PasswordService } from "@/auth/services/password.service";
import { TokenService } from "@/auth/services/token.service";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

@Resolver(() => UserType)
@UseGuards(JwtAuthGuard)
export class UserResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
  ) {}

  @Query(() => [UserType])
  async users(): Promise<UserType[]> {
    // 관리자만 접근 가능하도록 구현해야 함
    const users = await this.authService.findAllUsers();
    return users.map((user) => UserType.fromEntity(user));
  }

  @Query(() => UserType)
  async user(@Args("id") id: string): Promise<UserType> {
    // 관리자만 접근 가능하도록 구현해야 함
    const user = await this.authService.findUserById(id);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    return UserType.fromEntity(user);
  }

  @Mutation(() => UserType)
  async updateProfile(
    @CurrentUser() currentUser: User,
    @Args("input") updateProfileInput: UpdateProfileInput,
  ): Promise<UserType> {
    await this.authService.updateUser(currentUser.id, updateProfileInput);

    const updatedUser = await this.authService.findUserById(currentUser.id);
    if (!updatedUser) {
      throw new BadRequestException("User not found");
    }

    return UserType.fromEntity(updatedUser);
  }

  @Mutation(() => Boolean)
  async changePassword(
    @CurrentUser() currentUser: User,
    @Args("input") changePasswordInput: ChangePasswordInput,
  ): Promise<boolean> {
    const user = await this.authService.findUserById(currentUser.id);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    // 현재 비밀번호 검증
    const isPasswordValid = await this.passwordService.validatePassword(
      changePasswordInput.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    // 새 비밀번호 강도 검증
    const passwordStrength = this.passwordService.evaluatePasswordStrength(
      changePasswordInput.newPassword,
    );
    if (passwordStrength < 60) {
      throw new BadRequestException("New password is not strong enough");
    }

    // 새 비밀번호 해싱
    const newPasswordHash = await this.passwordService.hashPassword(
      changePasswordInput.newPassword,
    );

    // 비밀번호 업데이트
    await this.authService.updateUser(currentUser.id, {
      passwordHash: newPasswordHash,
    });

    // 모든 리프레시 토큰 취소 (보안상 이유로)
    await this.tokenService.revokeAllUserTokens(currentUser.id);

    return true;
  }

  @Mutation(() => Boolean)
  async deleteAccount(@CurrentUser() currentUser: User): Promise<boolean> {
    // 모든 리프레시 토큰 취소
    await this.tokenService.revokeAllUserTokens(currentUser.id);

    // 사용자 삭제
    const result = await this.authService.deleteUser(currentUser.id);
    return result > 0;
  }
}
