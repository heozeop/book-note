import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RefreshToken } from '../../../src/auth/entities/refresh-token.entity';
import { User } from '../../../src/auth/entities/user.entity';
import { RefreshTokenRepository } from '../../../src/auth/repositories/refresh-token.repository';
import { UserRepository } from '../../../src/auth/repositories/user.repository';
import { AuthService } from '../../../src/auth/services/auth.service';
import { CookieService } from '../../../src/auth/services/cookie.service';
import { PasswordService } from '../../../src/auth/services/password.service';
import { TokenService } from '../../../src/auth/services/token.service';
import { JwtStrategy } from '../../../src/auth/strategies/jwt.strategy';
import testOrmConfig from '../../../test/mikro-orm.test.config';
/**
 * 인증 모듈 테스트를 위한 테스트 모듈입니다.
 * SQLite 인메모리 데이터베이스를 사용합니다.
 */
@Module({
  imports: [
    // 테스트용 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
      load: [() => ({
        app: {
          jwt: {
            secret: 'test-secret-key',
            expiresIn: '1h',
            refreshTokenExpiryDays: 7,
          }
        }
      })]
    }),
    
    // 테스트용 JWT 모듈
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: 'test-secret-key',
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
    
    // 테스트용 Passport 모듈
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // 테스트용 MikroORM 모듈 (SQLite 인메모리 사용)
    MikroOrmModule.forRoot(testOrmConfig),
    
    // 엔티티 등록
    MikroOrmModule.forFeature({
      entities: [User, RefreshToken],
    }),
  ],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    JwtStrategy,
    UserRepository,
    RefreshTokenRepository,
    CookieService,
  ],
  exports: [
    AuthService,
    PasswordService,
    TokenService,
    JwtStrategy,
    JwtModule,
    CookieService,
    PassportModule,
    MikroOrmModule,
  ],
})
export class AuthTestModule {} 