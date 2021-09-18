import { ApiProperty } from '@nestjs/swagger'
import { UserDevice } from 'model/user.device.entity';
import { UserDevicePlatform } from 'shared/constant/user.device.platform.enum';

export class DeviceInfoDto {

    @ApiProperty()
    token: string;

    @ApiProperty()
    platform: UserDevicePlatform;
}
