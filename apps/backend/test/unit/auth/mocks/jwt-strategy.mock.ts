import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../../../../src/auth/services/auth.service';

/**
 * Mock JWT strategy for testing
 * Using a fixed test secret instead of retrieving from config
 */
@Injectable()
export class MockJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'test-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.findUserById(payload.sub);
    
    if (!user) {
      return null;
    }
    
    // Remove passwordHash from response
    const { passwordHash, ...result } = user;
    
    return result;
  }
} 