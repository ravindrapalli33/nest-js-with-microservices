import { User } from 'model/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async getUserByUsername(username: string){
        return await this.findOne({
            where: {
                username: username
            }
        });
    }
}
