import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserRepository } from './repositories/user.repository';
import { AuthResolver } from './resolvers/auth.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { AuthService } from './services/auth.service';
import { CookieService } from './services/cookie.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// Entities will be imported when implemented
// import { User } from './entities/user.entity';
// import { RefreshToken } from './entities/refresh-token.entity';

// Controllers, services, etc. will be imported when implemented
// import { AuthController } from './controllers/auth.controller';
// import { AuthResolver } from './resolvers/auth.resolver';
// import { AuthService } from './services/auth.service';
// import { JwtStrategy } from './strategies/jwt.strategy';
// import { TokenService } from './services/token.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
    MikroOrmModule.forFeature({
      entities: [User, RefreshToken],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    CookieService,
    JwtStrategy,
    JwtAuthGuard,
    UserRepository,
    RefreshTokenRepository,
    AuthResolver,
    UserResolver,
  ],
  exports: [
    AuthService,
    PasswordService,
    TokenService,
    CookieService,
    JwtModule,
    PassportModule,
    JwtAuthGuard,
  ],
})
export class AuthModule {} 