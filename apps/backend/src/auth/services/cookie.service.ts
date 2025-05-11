import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class CookieService {
  private readonly cookieDomain: string;
  private readonly isProduction: boolean;
  private readonly refreshTokenExpiresIn: number;
  private readonly accessTokenExpiresIn: number;

  constructor(private readonly configService: ConfigService) {
    this.cookieDomain = this.configService.get<string>('COOKIE_DOMAIN', 'localhost');
    this.isProduction = this.configService.get<string>('NODE_ENV', 'development') === 'production';
    this.refreshTokenExpiresIn = 60 * 60 * 24 * 30; // 30 days in seconds
    this.accessTokenExpiresIn = this.configService.get<number>('JWT_EXPIRES_IN_SECONDS', 3600); // 1 hour in seconds
  }

  /**
   * Set access token as HTTP-only cookie
   */
  setAccessTokenCookie(response: Response, accessToken: string): void {
    response.cookie('accessToken', accessToken, {
      httpOnly: true, // Not accessible via JavaScript
      secure: this.isProduction, // HTTPS only in production
      sameSite: 'strict', // Protection against CSRF
      maxAge: this.accessTokenExpiresIn * 1000, // Convert to milliseconds
      path: '/', // Available for all routes
      domain: this.cookieDomain,
    });
  }

  /**
   * Clear access token cookie
   */
  clearAccessTokenCookie(response: Response): void {
    response.clearCookie('accessToken', {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: '/',
      domain: this.cookieDomain,
    });
  }

  /**
   * Set refresh token as HTTP-only cookie
   */
  setRefreshTokenCookie(response: Response, refreshToken: string): void {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Not accessible via JavaScript
      secure: this.isProduction, // HTTPS only in production
      sameSite: 'strict', // Protection against CSRF
      maxAge: this.refreshTokenExpiresIn * 1000, // Convert to milliseconds
      path: '/auth', // Only available for auth routes
      domain: this.cookieDomain,
    });
  }

  /**
   * Clear refresh token cookie
   */
  clearRefreshTokenCookie(response: Response): void {
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: '/auth',
      domain: this.cookieDomain,
    });
  }

  /**
   * Clear all authentication cookies
   */
  clearAllAuthCookies(response: Response): void {
    this.clearAccessTokenCookie(response);
    this.clearRefreshTokenCookie(response);
  }
} 