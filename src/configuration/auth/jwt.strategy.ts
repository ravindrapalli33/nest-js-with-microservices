import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Config } from 'shared/constant/config.enum';
import { ConfigService } from 'shared/shared-service/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor (
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get(Config.JWT_SECRET),
        });
    }

    async validate(payload: any) {
        return { id: payload.id, username: payload.username };
    }
}
