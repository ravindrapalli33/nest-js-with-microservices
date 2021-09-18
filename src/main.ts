import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as admin from 'firebase-admin';
import * as helmet from 'helmet';
import * as i18n from 'i18n';
import * as morgan from 'morgan';
import * as path from 'path';
import { Config } from 'shared/constant/config.enum';
import { LocaleInfo } from 'shared/constant/locale.info';
import { HttpExceptionFilter } from 'shared/filter/http.exception.filter';
import { ConfigService } from 'shared/shared-service/config.service';
import { Utils } from 'utils/utils';
import { AppModule } from './app.module';
import logger from './shared/shared-service/logging-service';

declare const module: any;

let app: INestApplication;

async function bootstrap() {

  app = await NestFactory.create(AppModule);

  app.use(
    morgan(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" ' +
      ':status :res[content-length] :response-time ms ":referrer" ":user-agent"'
      ,
      {
        stream: logger.stream
      }
    )
  );

  const corsConfig: CorsOptions = {
    exposedHeaders: ['Content-Disposition']
  }

  if (AppModule.isProd) {
    corsConfig['origin'] = '*';
    corsConfig['methods'] = ['GET', 'PUT', 'POST', 'DELETE'];
  }

  app.enableCors(corsConfig);
  app.use(helmet());

  // setting gzip compression
  app.use(compression());

  // setting i18n for localization
  app.use(i18n.init);
  i18n.configure({
    locales: LocaleInfo.LOCALES,
    defaultLocale: LocaleInfo.DEFAULT_LOCATE,
    register: global,
    directory: __dirname + '/translations',
    objectNotation: true
  });

  i18n.setLocale(LocaleInfo.DEFAULT_LOCATE);

  // Basepath for swagger
  const basepath = AppModule.basepath ? `${AppModule.basepath}/api` : '/api';

  const swaggerOptions = new DocumentBuilder()
    .setTitle(AppModule.serviceName)
    .setDescription('API Documentation')
    .setVersion(Utils.getAppVersion())
    .addBearerAuth()
    .addServer(basepath)
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerOptions);

  SwaggerModule.setup(`/api/docs`, app, swaggerDoc);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => new BadRequestException(errors)
  }));
  app.enableShutdownHooks();

  await app.listen(AppModule.port, () => {
    logger.info(`Listening to the port ${AppModule.port}`);
  });

  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = AppModule.isDev ? err : {};

    // add this line to include winston logging
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    // render the error page
    res.status(err.status || 500).send('error');
  });

  // Initialize firebase
  const configService: ConfigService = app.get(ConfigService);
  console.log(configService.get(Config.FCM_KEY_PATH));
  admin.initializeApp({
    credential: admin.credential.cert(path.resolve(configService.get(Config.FCM_KEY_PATH)))
  });

  // NOTE : This was added to bypass certificate issues due to using
  // an ip address rather then the domain name matching the signed certificate
  // this should only be used for development and needs to be removed once
  // a proper domain is setup
  if (!AppModule.isProd) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
}

// shut down server
function shutdown() {
  if (app) {
    app.close();
  }
  process.exit();
}

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', () => {
  logger.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ');
  shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', () => {
  logger.info('Got SIGTERM (docker container stop). Graceful shutdown ');
  shutdown();
});

// Parent process dies
process.on('SIGHUP', () => {
  logger.warn('Got SIGHUP(Hang-up) from parent process (maybe docker)');
  shutdown();
});

// Start server
bootstrap();
