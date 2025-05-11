import { Body, Controller, Get, Headers, Ip, Param, Post, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { AuthTokenDto } from '../dtos/auth-token.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { AuthService } from '../services/auth.service';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
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
  ) {
    const { accessToken, user } = await this.authService.login(loginDto);
    
    // 사용자 전체 정보 조회
    const fullUser = await this.authService.findUserById(user.id as string);
    if (!fullUser) {
      throw new Error('User not found');
    }
    
    // 리프레시 토큰 생성
    const { token: refreshToken } = await this.tokenService.createRefreshToken(
      fullUser,
      userAgent,
      ipAddress,
    );
    
    return AuthResponseDto.create(fullUser, accessToken, refreshToken);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ): Promise<AuthTokenDto> {
    // 리프레시 토큰 검증
    const validToken = await this.tokenService.verifyRefreshToken(refreshToken);
    if (!validToken) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰');
    }

    // 기존 토큰 취소
    await this.tokenService.revokeRefreshToken(refreshToken);

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

    // 응답 생성
    const tokenDto = new AuthTokenDto();
    tokenDto.accessToken = accessToken;
    tokenDto.refreshToken = newRefreshToken;
    tokenDto.expiresIn = 3600; // 1시간 (초 단위)
    tokenDto.tokenType = 'Bearer';
    
    return tokenDto;
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