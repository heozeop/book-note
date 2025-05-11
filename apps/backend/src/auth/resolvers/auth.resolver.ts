import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { User } from "@/auth/entities/user.entity";
import { UserType } from "@/auth/graphql/types/user.type";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthService } from "@/auth/services/auth.service";
import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

@Resolver(() => UserType)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => UserType)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<UserType> {
    const userDetails = await this.authService.findUserById(user.id);
    if (!userDetails) {
      throw new Error("User not found");
    }
    return UserType.fromEntity(userDetails);
  }
}
