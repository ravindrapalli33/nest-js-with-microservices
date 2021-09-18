import { UserDevice } from 'model/user.device.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(UserDevice)
export class UserDeviceRepository extends Repository<UserDevice> {

  async getUserDeviceByPushToken(token: string) {
    return await this.findOne({
      where: {
        token: token
      }
    });
  }
}
