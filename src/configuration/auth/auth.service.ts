import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'service/user.service';
import * as crypto from 'crypto';
import { User } from 'model/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private userService: UserService
    ) {}

    async validateUser(username: string, pwd: string): Promise<any> {
        const user = await this.userService.getUserByUserName(username);
        if (!user) {
            return null;
        }

        // Verify password
        const hash = crypto.pbkdf2Sync(pwd, user.salt, 10000, 512, 'sha512').toString('hex')
        if (user.password !== hash) {
            return null;
        }

        const { password, ...result} = user;
        return result;
    }

    async login(user: User) {
        const payload = {
            username: user.username,
            id: user.id
        }
    
        return {
            accessToken: this.jwtService.sign(payload)
        }
    }
}
