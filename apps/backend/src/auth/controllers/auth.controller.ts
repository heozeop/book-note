import { Body, Controller, Get, Headers, Ip, Param, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RefreshToken } from '../decorators/refresh-token.decorator';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { CookieService } from '../services/cookie.service';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService
  ) {}

  @Post('register')
  @ApiOperation({ summary: '사용자 등록' })
  @ApiResponse({ status: 201, description: '사용자가 성공적으로 등록됨' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '이미 존재하는 이메일' })
  async register(@Body() registerDto: RegisterUserDto) {
    const user = await this.authService.register(registerDto);
    return UserResponseDto.fromEntity(user);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, user } = await this.authService.login(loginDto);
    
    const { token: refreshToken } = await this.tokenService.createRefreshToken(
      user as User,
      userAgent,
      ipAddress,
    );
    
    // Set HTTP-only cookies for both tokens
    this.cookieService.setAccessTokenCookie(response, accessToken);
    this.cookieService.setRefreshTokenCookie(response, refreshToken);
    
    // Return response without including tokens in body
    const authResponse = AuthResponseDto.create(user as User);
    
    return authResponse;
  }

  @Post('refresh-token')
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refreshToken(
    @RefreshToken() refreshToken: string,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean; message: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 제공되지 않았습니다');
    }
    
    // 리프레시 토큰 검증
    const validToken = await this.tokenService.verifyRefreshToken(refreshToken);
    if (!validToken) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰');
    }

    await this.tokenService.revokeAllUserTokens(validToken.user.id);

    // 사용자 조회
    const user = await this.authService.findUserById(validToken.user.id);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없음');
    }

    // 새로운 액세스 토큰 생성
    const { accessToken } = await this.authService.login({
      email: user.email,
      password: '', // 실제 비밀번호는 필요없음 (서비스 수정 필요)
    });

    // 새로운 리프레시 토큰 생성
    const { token: newRefreshToken } = await this.tokenService.createRefreshToken(
      user,
      userAgent,
      ipAddress,
    );
    
    // Set HTTP-only cookies for both tokens
    this.cookieService.setAccessTokenCookie(response, accessToken);
    this.cookieService.setRefreshTokenCookie(response, newRefreshToken);

    // 응답 생성 (토큰을 쿠키로만 반환)
    return { 
      success: true, 
      message: '토큰이 성공적으로 갱신되었습니다.' 
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response?: Response,
  ) {
    await this.tokenService.revokeAllUserTokens(user.id);
    
    // Clear all authentication cookies
    if (response) {
      this.cookieService.clearAllAuthCookies(response);
    }
    
    return { success: true, message: '로그아웃 되었습니다.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getCurrentUser(@CurrentUser() user: User) {
    return UserResponseDto.fromEntity(user);
  }

  @Get('password-strength/:password')
  @ApiOperation({ summary: '비밀번호 강도 검사' })
  @ApiParam({ name: 'password', description: '검사할 비밀번호' })
  @ApiResponse({ status: 200, description: '비밀번호 강도 점수' })
  checkPasswordStrength(@Param('password') password: string) {
    const strength = this.passwordService.evaluatePasswordStrength(password);
    let feedback = '';
    
    if (strength < 30) {
      feedback = '매우 취약한 비밀번호입니다.';
    } else if (strength < 60) {
      feedback = '취약한 비밀번호입니다. 더 강력한 비밀번호를 사용하세요.';
    } else if (strength < 80) {
      feedback = '적절한 비밀번호입니다.';
    } else {
      feedback = '강력한 비밀번호입니다.';
    }
    
    return {
      strength,
      feedback,
    };
  }
} 