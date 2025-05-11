import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12;
  private readonly PEPPER = process.env.PASSWORD_PEPPER || 'default-pepper-value';

  /**
   * 평문 비밀번호를 해싱합니다.
   * @param password 해싱할 평문 비밀번호
   * @returns 해싱된 비밀번호
   */
  async hashPassword(password: string): Promise<string> {
    const pepperedPassword = this.applyPepper(password);
    return bcrypt.hash(pepperedPassword, this.SALT_ROUNDS);
  }

  /**
   * 평문 비밀번호와 해시된 비밀번호를 비교합니다.
   * @param password 평문 비밀번호
   * @param hashedPassword 해시된 비밀번호
   * @returns 비밀번호가 일치하면 true, 그렇지 않으면 false
   */
  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    const pepperedPassword = this.applyPepper(password);
    return bcrypt.compare(pepperedPassword, hashedPassword);
  }

  /**
   * 비밀번호에 pepper를 적용합니다.
   * @param password 평문 비밀번호
   * @returns pepper가 적용된 비밀번호
   */
  private applyPepper(password: string): string {
    return `${password}${this.PEPPER}`;
  }

  /**
   * 보안 토큰을 생성합니다.
   * @param length 토큰 길이 (기본값: 32)
   * @returns 무작위 토큰 문자열
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * 비밀번호 보안 강도를 평가합니다.
   * @param password 평가할 비밀번호
   * @returns 점수 (0-100, 높을수록 강함)
   */
  evaluatePasswordStrength(password: string): number {
    let score = 0;
    
    // 길이 점수 (최대 25점)
    score += Math.min(25, Math.floor(password.length / 2) * 5);
    
    // 대문자 포함 (15점)
    if (/[A-Z]/.test(password)) score += 15;
    
    // 소문자 포함 (15점)
    if (/[a-z]/.test(password)) score += 15;
    
    // 숫자 포함 (15점)
    if (/\d/.test(password)) score += 15;
    
    // 특수문자 포함 (15점)
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    // 반복되는 문자가 있으면 감점
    const repeats = password.match(/(.)\1{2,}/g);
    if (repeats) score -= repeats.length * 5;
    
    // 최종 점수 범위 조정
    return Math.max(0, Math.min(100, score));
  }
} 