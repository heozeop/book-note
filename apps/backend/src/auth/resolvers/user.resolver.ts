import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../decorators/current-user.decorator";
import {
  ChangePasswordInput,
  UpdateProfileInput,
  UserType,
} from "../dtos/user.graphql";
import { User } from "../entities/user.entity";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AuthService } from "../services/auth.service";
import { PasswordService } from "../services/password.service";
import { TokenService } from "../services/token.service";

@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
  ) {}

  @Query(() => [UserType])
  @UseGuards(JwtAuthGuard)
  async users(): Promise<UserType[]> {
    // 관리자만 접근 가능하도록 구현해야 함
    const users = await this.authService.findAllUsers();
    return users.map((user) => UserType.fromEntity(user));
  }

  @Query(() => UserType)
  @UseGuards(JwtAuthGuard)
  async user(@Args("id") id: string): Promise<UserType> {
    // 관리자만 접근 가능하도록 구현해야 함
    const user = await this.authService.findUserById(id);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    return UserType.fromEntity(user);
  }

  @Mutation(() => UserType)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@CurrentUser() currentUser: User): Promise<boolean> {
    // 모든 리프레시 토큰 취소
    await this.tokenService.revokeAllUserTokens(currentUser.id);

    // 사용자 삭제
    const result = await this.authService.deleteUser(currentUser.id);
    return result > 0;
  }
}
