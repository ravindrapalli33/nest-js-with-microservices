import { HttpException, HttpStatus, UnprocessableEntityException } from '@nestjs/common';
import { __ } from 'i18n';
import logger from '../shared/shared-service/logging-service';
import { version } from './../../package.json';
import * as moment from 'moment-timezone';

export class DateRange {
    startDate: moment.Moment;
    endDate: moment.Moment;
}

export class Utils {

    public static handleException(exception: any) {
        if (exception.response && exception.response.data) {
            throw new HttpException(exception.response.data.status_txt || exception.response.data.errorMessage || __('ERRORS.UNRECOGNIZED'), exception.response.status);
        } else {
            logger.error(`unexpected exception occured: \n`);
            console.error(exception);
            throw new HttpException(__('ERRORS.UNRECOGNIZED'), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public static getAppVersion() {
        return version;
    }

}
