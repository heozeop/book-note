import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { AuthService } from '../services/auth.service';
import { PasswordService } from '../services/password.service';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService
  ) {}

  @Post('register')
  @ApiOperation({ summary: '사용자 등록' })
  @ApiResponse({ status: 201, description: '사용자가 성공적으로 등록됨' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '이미 존재하는 이메일' })
  async register(@Body() registerDto: RegisterUserDto) {
    const user = await this.authService.register(registerDto);
    // 비밀번호 해시는 응답에서 제외
    const { passwordHash, ...result } = user;
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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