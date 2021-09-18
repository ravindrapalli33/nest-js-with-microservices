import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationRequestDto {

    @ApiProperty()
    token?: string;

    @ApiProperty()
    tokens?: string[];

    @ApiProperty()
    title?: string;

    @ApiProperty()
    message?: string;

    @ApiProperty()
    messages?: string[];

}
