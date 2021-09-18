import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'model/user.entity';
import { UserRepository } from 'repository/user.repository';
import { UserService } from 'service/user.service';
import { Config } from 'shared/constant/config.enum';
import { ConfigService } from 'shared/shared-service/config.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get(Config.JWT_SECRET),
        signOptions: {
          expiresIn: configService.get(Config.ACCESS_TOKEN_EXPIRY)
        }
      })
    }),
    TypeOrmModule.forFeature([User, UserRepository])
  ],
  providers: [AuthService, UserService, LocalStrategy, JwtStrategy],
  exports: [AuthService, UserService, PassportModule, JwtModule]
})
export class AuthModule { }
