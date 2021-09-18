import { Injectable } from '@nestjs/common';
import { HealthCheckStatus } from 'shared/constant/health.check.status';
import { AppVersionResponse } from 'shared/dto/app.version.response';
import { Utils } from 'utils/utils';
import logger from './shared/shared-service/logging-service';
@Injectable()
export class AppService {

  constructor () { }

  healthCheck(): HealthCheckStatus {
    return new HealthCheckStatus(200, 'Server is running')
  }

  logging(error: any) {
    logger.error(JSON.stringify(error), { tags: ['UI'] });
  }

  appVersionInfo(): AppVersionResponse {
    return new AppVersionResponse(Utils.getAppVersion());
  }

}
