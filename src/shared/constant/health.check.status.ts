import { ApiProperty } from '@nestjs/swagger'

export class HealthCheckStatus {

    @ApiProperty()
    status: number;

    @ApiProperty()
    message: string;

    constructor(statusNumber: number, msg: string) {
        this.status = statusNumber;
        this.message = msg;
    }
}
