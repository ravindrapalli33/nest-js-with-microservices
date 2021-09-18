import { CacheInterceptor, ExecutionContext, Injectable } from "@nestjs/common";
import { Utils } from "utils/utils";
import { findIndex } from "lodash";

// Checks if URL strictly ends with one of the endpoints
const CACHE_EXCLUDED_ENDPOINTS_STRICT = [
  '/api/auth/logout'
];

// Checks if URL contains one of the endpoints 
const CACHE_EXCLUDED_ENDPOINTS_FLEXIBLE = [
  '/api/healthcheck'
];

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;
    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';
    const requestUrl = httpAdapter.getRequestUrl(request);

    let key = Utils.getAppVersion() + '_' + requestUrl;

    if (
      !isGetRequest ||
      (
        isGetRequest &&
        (
          findIndex(CACHE_EXCLUDED_ENDPOINTS_STRICT, (e: any) => requestUrl.endsWith(e)) !== -1 ||
          findIndex(CACHE_EXCLUDED_ENDPOINTS_FLEXIBLE, (e: any) => requestUrl.indexOf(e) !== -1) !== -1
        )
      )
    ) {
      return undefined;
    }

    return key;
  }
}
