import { Controller, Get, HttpStatus, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from 'service/user.service';

@Controller('user')
export class UserController {

    constructor(
        private userService: UserService
    ) { }

    @Get('/')
    @ApiOperation({ summary: 'User details' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User details retrieved successfully.',
    })
    async getUserDetails(@Request() req) {
        return this.userService.getUserByUserName('test');
    }
}
