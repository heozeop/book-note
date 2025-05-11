import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

/**
 * Auth E2E Testing Utilities
 * Provides helper methods for authentication-related tests
 */
export class AuthTestUtil {
  /**
   * Create a test user and return the credentials
   */
  static async createTestUser(
    app: INestApplication,
    options: {
      email?: string;
      password?: string;
      displayName?: string;
      timezone?: string;
    } = {},
  ): Promise<{ email: string; password: string; id: string }> {
    const email = options.email || `test-${Date.now()}@example.com`;
    const password = options.password || "StrongP@ssword123!";
    const displayName = options.displayName || "Test User";
    const timezone = options.timezone || "Asia/Seoul";

    const registerDto = {
      email,
      password,
      displayName,
      timezone,
    };

    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send(registerDto);

    if (response.status !== 201) {
      throw new Error(
        `Failed to create test user: ${JSON.stringify(response.body)}`,
      );
    }

    return {
      email,
      password,
      id: response.body.id,
    };
  }

  /**
   * Helper function to safely access cookies
   */
  static getCookies(response: request.Response): string[] {
    const cookies = response.headers["set-cookie"];
    return Array.isArray(cookies) ? cookies : [];
  }

  /**
   * Extract access token from cookies if needed for headers
   */
  static extractAccessTokenFromCookies(cookies: string[]): string | null {
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.startsWith("accessToken="),
    );
    if (!accessTokenCookie) return null;

    const match = accessTokenCookie.match(/accessToken=([^;]+)/);
    return match ? match[1] : null;
  }

  /**
   * Debug cookies and log any issues
   */
  static debugCookies(cookies: string[]): void {
    if (cookies.length === 0) {
      console.warn("No cookies found");
      return;
    }

    const accessTokenCookie = cookies.find((cookie) =>
      cookie.includes("accessToken="),
    );
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.includes("refreshToken="),
    );

    console.log("Access Token Cookie present:", !!accessTokenCookie);
    console.log("Refresh Token Cookie present:", !!refreshTokenCookie);

    if (accessTokenCookie) {
      console.log("Access Token Cookie:", accessTokenCookie);
    }

    if (refreshTokenCookie) {
      console.log("Refresh Token Cookie:", refreshTokenCookie);
    }
  }

  /**
   * Login with the given credentials and return the cookies and user id
   */
  static async login(
    app: INestApplication,
    credentials: { email: string; password: string },
  ): Promise<{
    cookies: string[];
    userId: string | null;
    accessToken: string | null;
  }> {
    try {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send(credentials);

      // Login should return 200 or 201
      if (response.status === 200 || response.status === 201) {
        console.log("Login successful with status", response.status);

        // Get cookies from response
        const cookies = this.getCookies(response);

        // Extract access token from cookies if needed for Authorization header
        const accessToken = this.extractAccessTokenFromCookies(cookies);

        return {
          cookies,
          userId: response.body.user?.id || null,
          accessToken,
        };
      }

      console.warn(
        `Login failed with status ${response.status}:`,
        response.body,
      );
      return { cookies: [], userId: null, accessToken: null };
    } catch (error) {
      console.error("Exception during login:", error);
      return { cookies: [], userId: null, accessToken: null };
    }
  }

  /**
   * Refresh tokens using the refresh token cookie
   */
  static async refreshTokens(
    app: INestApplication,
    cookies: string[],
  ): Promise<{ cookies: string[]; success: boolean }> {
    try {
      const response = await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Cookie", cookies);

      if (response.status === 200) {
        const newCookies = this.getCookies(response);
        return { cookies: newCookies, success: true };
      }

      return { cookies: [], success: false };
    } catch (error) {
      console.error("Exception during token refresh:", error);
      return { cookies: [], success: false };
    }
  }

  /**
   * Log out a user by revoking all refresh tokens and clearing cookies
   */
  static async logout(
    app: INestApplication,
    cookies: string[],
  ): Promise<boolean> {
    try {
      const response = await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Cookie", cookies);

      return response.status === 200;
    } catch (error) {
      console.error("Exception during logout:", error);
      return false;
    }
  }

  /**
   * Get current user data
   */
  static async getCurrentUser(
    app: INestApplication,
    cookies: string[],
  ): Promise<Record<string, any> | null> {
    try {
      const response = await request(app.getHttpServer())
        .get("/auth/me")
        .set("Cookie", cookies);

      if (response.status !== 200) {
        return null;
      }

      return response.body;
    } catch (error) {
      console.error("Exception getting current user:", error);
      return null;
    }
  }

  /**
   * Check password strength and return the evaluation
   */
  static async checkPasswordStrength(
    app: INestApplication,
    password: string,
  ): Promise<{ strength: number; feedback: string } | null> {
    try {
      const response = await request(app.getHttpServer()).get(
        `/auth/password-strength/${password}`,
      );

      if (response.status !== 200) {
        return null;
      }

      return {
        strength: response.body.strength,
        feedback: response.body.feedback,
      };
    } catch (error) {
      console.error("Exception checking password strength:", error);
      return null;
    }
  }

  /**
   * Generate test data for different user types based on personas from PRD
   */
  static getPersonaTestData(): Array<{
    email: string;
    password: string;
    displayName: string;
    persona: string;
    description: string;
  }> {
    return [
      {
        email: `soojin-${Date.now()}@example.com`,
        password: "StrongP@ssword123!",
        displayName: "Soo-jin",
        persona: "professional",
        description: "30세, 직장인 독서가, 출판/미디어 회사 마케터",
      },
      {
        email: `jaewoo-${Date.now()}@example.com`,
        password: "SecureP@ssword456!",
        displayName: "Jae-woo",
        persona: "student",
        description: "25세, 대학원생 & 독서모임 운영",
      },
      {
        email: `minjun-${Date.now()}@example.com`,
        password: "ComplexP@ssword789!",
        displayName: "Min-jun",
        persona: "casual",
        description: "45세, IT 매니저 & 취미 독서가",
      },
    ];
  }
}
