import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../services/auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("app.jwt.secret"),
    });
  }

  /**
   * JWT 토큰의 payload를 검증하고 사용자 정보를 반환합니다.
   * @param payload JWT 페이로드
   * @returns 인증된 사용자 객체
   */
  async validate(payload: any) {
    const user = await this.authService.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
    }

    // 비밀번호 해시는 응답에서 제외
    const { passwordHash, ...result } = user;

    return result;
  }
}
