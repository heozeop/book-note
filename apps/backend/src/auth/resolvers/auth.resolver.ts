import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../decorators/current-user.decorator";
import { UserType } from "../dtos/user.graphql";
import { User } from "../entities/user.entity";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AuthService } from "../services/auth.service";

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
