import { CacheModule, CacheModuleOptions, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { JwtAuthGuard } from 'configuration/auth/jwt.auth.guard';
import * as moment from 'moment-timezone';
import { Config } from 'shared/constant/config.enum';
import { RoleGuard } from 'shared/guard/role.guard';
import { CustomCacheInterceptor } from 'shared/interceptor/custom.cache.interceptor';
import { LanguageMiddleware } from 'shared/middleware/language.middleware';
import { ConfigService } from 'shared/shared-service/config.service';
import { SharedModule } from 'shared/shared.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './configuration/auth/auth.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: configService.get(Config.DB_HOST),
        port: parseInt(configService.get(Config.DB_PORT), 10),
        username: configService.get(Config.DB_USER),
        password: configService.get(Config.DB_PASSWORD),
        database: configService.get(Config.DB_NAME),
        retryDelay: 5000,
        entities: [
          `${__dirname}/**/*.entity{.ts,.js}`
        ],
        migrations: [
          `${__dirname}/migrations/*{.ts,.js}`
        ],
        migrationsRun: true,
        synchronize: true,
        logging: configService.isDevelopment ? [
          'query',
          'error',
          'warn',
          'migration'
        ] : [
          'error',
          'warn'
        ],
      }),
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): CacheModuleOptions => ({
        store: redisStore,
        ttl: parseInt(configService.get(Config.REDIS_TTL), 10),
        host: configService.get(Config.REDIS_HOST),
        port: configService.get(Config.REDIS_PORT),
        password: configService.get(Config.REDIS_PASSWORD)
      })
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomCacheInterceptor
    }
  ],
})
export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
    consumer.apply(LanguageMiddleware).forRoutes('');
  }

  static serviceName: string;

  static host: string;

  static port: number | string;

  static version: string;

  static basepath: string;

  static isDev: boolean;

  static isProd: boolean;

  constructor (
    private readonly configService: ConfigService
  ) {
    AppModule.serviceName = configService.get(Config.NAME);
    AppModule.port = this.normalizePort(configService.get(Config.PORT));
    AppModule.version = configService.get(Config.VERSION);
    AppModule.basepath = configService.get(Config.BASEPATH);
    AppModule.isDev = configService.isDevelopment;
    AppModule.isProd = configService.isProduction;

    // Global Timezone
    moment.tz.setDefault(this.configService.get(Config.APP_TIMEZONE));
  }

  private normalizePort(param: number | string): number | string {
    const port: number = typeof param === 'string' ? parseInt(param, 10) : param;
    if (port > 0) { return port; } else { throw new Error('Invalid port number'); }
  }
}
