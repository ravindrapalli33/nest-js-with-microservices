import { Body, Controller, HttpStatus, Param, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Public } from 'configuration/auth/public.decorator';
import { NotificationService } from 'service/notification.service';
import { PushNotificationTopic } from 'shared/constant/push.notification.topic.enum';
import { Role } from 'shared/constant/role.enum';
import { Roles } from 'shared/decorator/role.decorator';
import { DeviceInfoDto } from 'shared/dto/device.info.dto';
import { SendNotificationRequestDto } from 'shared/dto/send.notifcation.request.dto';

@Controller('notification')
export class NotificationController {

    constructor (
        private notificationService: NotificationService
    ) { }

    @Post('/register/token')
    @ApiOperation({ summary: 'Register device token' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Device token registered successfully.',
    })
    async registerDeviceToken(@Request() req, @Body() deviceInfo: DeviceInfoDto) {
        return this.notificationService.storeAndRegisterDeviceToken(req.user, deviceInfo)
    }

    // @Roles(Role.Admin)
    @Public()
    @Post('/topic/send/:topic')
    @ApiOperation({ summary: 'Send notification to topic' })
    @ApiParam({
        name: 'topic',
        required: false
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Sent notification to topic successfully.',
    })
    async sendToTopic(
        @Request() req,
        @Body() notificationRequestInfo: SendNotificationRequestDto,
        @Param('topic') topic: string
    ) {
        return this.notificationService.sendMessageToTopic(
            topic || PushNotificationTopic.APP,
            notificationRequestInfo.message,
            notificationRequestInfo.title
        );
    }
}
