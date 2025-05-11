import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  AuthPayload,
  AuthTokens,
  LoginInput,
  RegisterInput,
  UserType
} from '../dtos/user.graphql';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Resolver(() => UserType)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') loginInput: LoginInput,
    @Context() context: any,
  ): Promise<AuthPayload> {
    // 로그인 처리
    const { accessToken, user } = await this.authService.login({
      email: loginInput.email,
      password: loginInput.password,
    });

    // 리프레시 토큰 생성
    const userAgent = context.req?.headers['user-agent'];
    const ipAddress = context.req?.ip;
    const { token: refreshToken } = await this.tokenService.createRefreshToken(
      user as User,
      userAgent,
      ipAddress,
    );

    // 응답 구성
    return {
      user: {
        ...user,
        isVerified: !!user.verifiedAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1시간 (초 단위)
        tokenType: 'Bearer',
      },
    };
  }

  @Mutation(() => AuthPayload)
  async register(
    @Args('input') registerInput: RegisterInput,
    @Context() context: any,
  ): Promise<AuthPayload> {
    // 사용자 등록
    const user = await this.authService.register({
      email: registerInput.email,
      password: registerInput.password,
      displayName: registerInput.displayName,
      profileImage: registerInput.profileImage,
      timezone: registerInput.timezone,
    });

    // JWT 토큰 생성
    const { accessToken } = await this.authService.login({
      email: registerInput.email,
      password: registerInput.password,
    });

    // 리프레시 토큰 생성
    const userAgent = context.req?.headers['user-agent'];
    const ipAddress = context.req?.ip;
    const { token: refreshToken } = await this.tokenService.createRefreshToken(
      user,
      userAgent,
      ipAddress,
    );

    // 응답 구성
    return {
      user: {
        ...user,
        isVerified: !!user.verifiedAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1시간 (초 단위)
        tokenType: 'Bearer',
      },
    };
  }

  @Mutation(() => Boolean)
  async logout(
    @Args('refreshToken') refreshToken: string,
  ): Promise<boolean> {
    return this.tokenService.revokeRefreshToken(refreshToken);
  }

  @Query(() => UserType)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<UserType> {
    const userDetails = await this.authService.findUserById(user.id);
    return {
      ...userDetails,
      isVerified: !!userDetails.verifiedAt,
    };
  }

  @Mutation(() => AuthTokens)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
    @Context() context: any,
  ): Promise<AuthTokens> {
    // 리프레시 토큰 검증
    const validToken = await this.tokenService.verifyRefreshToken(refreshToken);
    if (!validToken) {
      throw new Error('Invalid refresh token');
    }

    // 기존 토큰 취소
    await this.tokenService.revokeRefreshToken(refreshToken);

    // 사용자 조회
    const user = await this.authService.findUserById(validToken.user.id);
    if (!user) {
      throw new Error('User not found');
    }

    // 새로운 액세스 토큰 생성
    const { accessToken } = await this.authService.login({
      email: user.email,
      password: '', // 실제 비밀번호는 필요없음 (임시 코드, 수정 필요)
    });

    // 새로운 리프레시 토큰 생성
    const userAgent = context.req?.headers['user-agent'];
    const ipAddress = context.req?.ip;
    const { token: newRefreshToken } = await this.tokenService.createRefreshToken(
      user,
      userAgent,
      ipAddress,
    );

    // 응답 구성
    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600, // 1시간 (초 단위)
      tokenType: 'Bearer',
    };
  }
} 