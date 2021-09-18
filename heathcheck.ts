import * as config from 'config';
import * as http from 'http';
import logger from './src/shared/services/logging-service';

const options: http.RequestOptions = {
  timeout: 2000,
  host: 'localhost',
  port:  process.env.PORT || config.get('port'),
  path: '/api/healthcheck' // must be the same as HEALTHCHECK in Dockerfile
}

const request = http.request(options, (res) => {
  process.exitCode = (res.statusCode === 200) ? 0 : 1
  process.exit()
})

request.on('error', (err) => {
  logger.error(err);
  process.exit(1)
})

request.end()
