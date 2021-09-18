import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as i18n from 'i18n';
import * as moment from 'moment-timezone';
import { LocaleInfo } from 'shared/constant/locale.info';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: Function) {

        const language = req.headers['content-language'];

        if (i18n.getLocales().indexOf(language) != -1) {
            i18n.setLocale(language);
        } else {
            i18n.setLocale(LocaleInfo.DEFAULT_LOCATE);
        }

        moment.locale(i18n.getLocale());
        next();
    }
}
