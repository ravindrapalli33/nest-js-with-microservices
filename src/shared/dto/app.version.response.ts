import { ApiProperty } from '@nestjs/swagger'

export class AppVersionResponse {

    @ApiProperty()
    version: string;

    constructor(version: string) {
        this.version = version;
    }
}
