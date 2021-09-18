import { Body, Controller, Get, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from 'configuration/auth/auth.service';
import { LocalAuthGuard } from 'configuration/auth/local.auth.guard';
import { Public } from 'configuration/auth/public.decorator';
import { HealthCheckStatus } from 'shared/constant/health.check.status';
import { Role } from 'shared/constant/role.enum';
import { Roles } from 'shared/decorator/role.decorator';
import { AppVersionResponse } from 'shared/dto/app.version.response';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor (
    private authService: AuthService,
    private readonly appService: AppService
  ) { }

  @Public()
  @Get('/')
  @ApiOperation({ summary: 'Welcome' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Welcome' })
  welcome() {
    return 'Welcome!!!';
  }

  @Roles(Role.Admin)
  @Get('/admin')
  @ApiOperation({ summary: 'Admin Welcome' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Welcome' })
  adminWelcome() {
    return 'Welcome!!!';
  }

  @Public()
  @Get('healthcheck')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns healthcheck status.', type: HealthCheckStatus })
  healthCheck(): HealthCheckStatus {
    return this.appService.healthCheck()
  }

  @Public()
  @Post('logging')
  @ApiOperation({ summary: 'Logging' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Log entry recorded' })
  logging(@Body() error) {
    this.appService.logging(error);
  }

  @Public()
  @Get('version')
  @ApiOperation({ summary: 'App Version' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns app version information', type: AppVersionResponse })
  appVersionInfo() {
    return this.appService.appVersionInfo();
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User succsefuly logged in.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User login failed.',
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Get('auth/logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User succsefuly logged out.',
  })
  async logout(@Request() req) {
    return req.logout();
  }
}
