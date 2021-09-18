import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { UserDevice } from 'model/user.device.entity';
import { User } from 'model/user.entity';
import { UserDeviceRepository } from 'repository/user.device.repository';
import { ClientInformation } from 'shared/constant/client.information.enum';
import { PushNotificationTopic } from 'shared/constant/push.notification.topic.enum';
import { DeviceInfoDto } from 'shared/dto/device.info.dto';
import logger from 'shared/shared-service/logging-service';

@Injectable()
export class NotificationService {

    constructor (
        @InjectRepository(UserDeviceRepository)
        private readonly userDeviceRepository: UserDeviceRepository,
    ) { }

    async storeAndRegisterDeviceToken(user: User, deviceInfo: DeviceInfoDto): Promise<UserDevice> {
        let userDevice: UserDevice = await this.userDeviceRepository.getUserDeviceByPushToken(deviceInfo.token);

        if (!userDevice) {
            // Store device token
            userDevice = await this.userDeviceRepository.save(
                UserDevice.create({
                    token: deviceInfo.token,
                    platform: deviceInfo.platform,
                    user: user
                })
            );
            logger.info(`Succesfully added new user device with id: ${userDevice.id}`);
        }

        // Subscribe to global app topic by default
        this.subscribeToPushNotifications(deviceInfo.token);

        return userDevice;
    }

    async subscribeToPushNotifications(token: string, topic = PushNotificationTopic.APP): Promise<admin.messaging.MessagingTopicManagementResponse> {
        await this.unSubscribeToPushNotifications(token, topic);
        const subscriptionResponse = await admin.messaging().subscribeToTopic(token, topic);
        logger.info(`Push notification subscription response: ${JSON.stringify(subscriptionResponse)}`);

        return subscriptionResponse;
    }

    async unSubscribeToPushNotifications(token: string, topic = PushNotificationTopic.APP): Promise<admin.messaging.MessagingTopicManagementResponse> {
        const unSubscriptionResponse = await admin.messaging().unsubscribeFromTopic(token, topic);
        logger.info(`Push notification unsubscribe response: ${JSON.stringify(unSubscriptionResponse)}`);

        return unSubscriptionResponse;
    }

    async sendMessageToTopic(topic: string, message: string, title?: string) {
        const messageData = await this.buildMessage(
            {
                title: title || ClientInformation.NAME,
                body: message
            }
        );

        const response = await admin.messaging().send({
            topic: topic,
            ...messageData
        });
        logger.info(`Push notification sent to topic with response: ${JSON.stringify(response)}`);

        return response;
    }

    async sendMessageToToken(token: string, message: string, title?: string) {
        const messageData = await this.buildTokenMessage(
            token,
            {
                title: title || ClientInformation.NAME,
                body: message
            }
        );

        return await admin.messaging().send(messageData);
    }

    async sendAllMessagesToToken(token: string, messages: any[]) {
        let messagesData: admin.messaging.Message[] = [];
        messages.forEach(async m => {
            return messagesData.push(
                await this.buildTokenMessage(
                    token,
                    {
                        title: m.title || ClientInformation.NAME,
                        body: m.message
                    }
                )
            );
        });

        return await admin.messaging().sendAll(messagesData);
    }

    async sendMulticastMessageToTokens(tokens: string[], message: string, title?: string) {
        const messageData = await this.buildTokensMulticastMessage(
            tokens,
            {
                title: title || ClientInformation.NAME,
                body: message
            }
        );

        return await admin.messaging().sendMulticast(messageData);
    }

    private async buildTokensMulticastMessage(tokens: string[], notification: any, options?: any): Promise<admin.messaging.MulticastMessage> {
        const messageBuild = await this.buildMessage(notification, options);

        return {
            tokens: tokens,
            ...messageBuild
        };
    }

    private async buildTokenMessage(token: string, notification: any, options?: any): Promise<admin.messaging.Message> {
        const messageBuild = await this.buildMessage(notification, options);

        return {
            token: token,
            ...messageBuild
        };
    }

    private async buildMessage(notification: any, options?: any) {
        const messageData = {
            notification: {
                title: notification.title,
                body: notification.body
            }
        };

        if (notification.imageUrl) {
            messageData.notification['imageUrl'] = notification.imageUrl;
        }

        if (options?.data) {
            messageData['data'] = options.data;
        }

        if (options?.android) {
            messageData['android'] = {
                priority: 'high',
                ttl: options.android.ttl || 604800, // one week in seconds
                notification: {
                    title: notification.title,
                    body: notification.body
                }
            };

            if (options.android.icon) {
                messageData['android'].notification['icon'] = options.android.icon;
            }

            if (options.android.color) {
                messageData['android'].notification['color'] = options.android.color;
            }

            if (options.android.sound) {
                messageData['android'].notification['sound'] = options.android.sound;
            }
        }

        messageData['webpush'] = {
            notification: {
                title: notification.title,
                body: notification.body
            },
            headers: {
                Urgency: "high",
            }
        };
        if (options?.webpush) {
            messageData['webpush'] = {};

            if (options.webpush.headers) {
                messageData['webpush']['headers'] = options.webpush.headers;
            }

            if (options.webpush.data) {
                messageData['webpush']['data'] = options.webpush.data;
            }
        }

        return messageData;
    }

}
