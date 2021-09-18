import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'model/user.entity';
import { UserRepository } from 'repository/user.repository';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
    ) { }

    async getUserByUserName(username: string): Promise<User> {
        return await this.userRepository.getUserByUsername(username);
    }

}
