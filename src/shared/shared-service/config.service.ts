import { Injectable } from '@nestjs/common';
import * as envConfig from 'config';
import { Config } from 'shared/constant/config.enum';

@Injectable()
export class ConfigService {

    private enviroment: string = process.env.NODE_ENV || 'development';

    get(name: Config): string {
        return process.env[name] || envConfig.get(name);
    }

    get isDevelopment(): boolean {
        return this.enviroment === 'development';
    }

    get isProduction(): boolean {
        return this.enviroment === 'production';
    }
}
