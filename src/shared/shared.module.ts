import { HttpModule } from '@nestjs/axios';
import {
    Global,
    Module
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from 'controller/notification.controller';
import { UserController } from 'controller/user.controller';
import { UserDevice } from 'model/user.device.entity';
import { User } from 'model/user.entity';
import { UserDeviceRepository } from 'repository/user.device.repository';
import { UserRepository } from 'repository/user.repository';
import { NotificationService } from 'service/notification.service';
import { UserService } from 'service/user.service';
import { ConfigService } from './shared-service/config.service';

@Global()
@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([User, UserRepository, UserDevice, UserDeviceRepository])
    ],
    providers: [
        ConfigService,
        UserService,
        NotificationService
    ],
    exports: [
        ConfigService,
        HttpModule,
        UserService,
        NotificationService
    ],
    controllers: [UserController, NotificationController],
})
export class SharedModule { }
