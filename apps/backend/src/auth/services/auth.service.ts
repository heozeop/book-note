import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * 사용자 등록
   * @param registerDto 사용자 등록 정보
   * @returns 생성된 사용자 객체
   */
  async register(registerDto: RegisterUserDto): Promise<User> {
    const { password, displayName, profileImage, timezone } = registerDto;
    
    // 이메일 정규화 및 검증
    const email = this.normalizeEmail(registerDto.email);
    this.validateEmail(email);

    // 이메일 중복 확인
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('이미 등록된 이메일입니다.');
    }

    // 비밀번호 강도 검증
    const passwordStrength = this.passwordService.evaluatePasswordStrength(password);
    if (passwordStrength < 60) {
      throw new BadRequestException('비밀번호가 충분히 강력하지 않습니다.');
    }

    // 비밀번호 해싱
    const passwordHash = await this.passwordService.hashPassword(password);

    // 새 사용자 생성
    const newUser = new User();
    newUser.email = email;
    newUser.passwordHash = passwordHash;
    newUser.displayName = displayName;

    // 선택적 정보 설정
    if (profileImage) {
      newUser.profileImage = profileImage;
    }

    if (timezone) {
      newUser.timezone = timezone;
    }

    await this.userRepository.persistAndFlush(newUser);
    return newUser;
  }

  /**
   * 사용자 로그인
   * @param loginDto 로그인 정보
   * @returns JWT 액세스 토큰
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const { password } = loginDto;
    
    // 이메일 정규화
    const email = this.normalizeEmail(loginDto.email);

    // 사용자 확인
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 검증
    const isPasswordValid = await this.passwordService.validatePassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // JWT 토큰 생성
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload);

    // 사용자 정보 반환 (비밀번호 제외)
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  /**
   * 사용자 ID로 사용자 조회
   * @param userId 사용자 ID
   * @returns 사용자 객체
   */
  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  /**
   * 모든 사용자 조회
   * @returns 사용자 객체 배열
   */
  async findAllUsers(): Promise<User[]> {
    return this.userRepository.getAllUsers();
  }

  /**
   * 사용자 정보 업데이트
   * @param userId 사용자 ID
   * @param updateData 업데이트할 정보
   * @returns 업데이트된 행 수
   */
  async updateUser(userId: string, updateData: Partial<User>): Promise<number> {
    return this.userRepository.updateUser(userId, updateData);
  }

  /**
   * 사용자 삭제
   * @param userId 사용자 ID
   * @returns 삭제된 행 수
   */
  async deleteUser(userId: string): Promise<number> {
    return this.userRepository.deleteUser(userId);
  }

  /**
   * 이메일 주소를 정규화합니다.
   * @param email 원본 이메일 주소
   * @returns 정규화된 이메일 주소 (소문자)
   */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * 이메일 주소의 유효성을 검사합니다.
   * @param email 검사할 이메일 주소
   */
  private validateEmail(email: string): void {
    // 기본 이메일 형식 검증 (class-validator가 이미 수행하지만, 추가 검증을 원할 경우)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('유효하지 않은 이메일 형식입니다.');
    }

    // 일회용 이메일 도메인 차단 (예시, 실제 구현 시 더 많은 도메인 추가 필요)
    const disposableDomains = ['tempmail.com', 'guerrillamail.com', 'mailinator.com'];
    const domain = email.split('@')[1];
    if (disposableDomains.includes(domain)) {
      throw new BadRequestException('일회용 이메일은 사용할 수 없습니다.');
    }
  }
} 