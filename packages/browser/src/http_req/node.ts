import * as request_lib from 'request';
import Promise from 'promise-polyfill';

import { errors, IHttpRequest, IHttpResponse, Requester } from './api';

type requestAPI = request_lib.RequestAPI<
  request_lib.Request,
  request_lib.CoreOptions,
  request_lib.RequiredUriUrl
>;

export function makeRequester(api: requestAPI): Requester {
  return (req: IHttpRequest): Promise<IHttpResponse> => {
    return request(req, api);
  };
}

let rateLimitReset = 0;

function request(req: IHttpRequest, api: requestAPI): Promise<IHttpResponse> {
  let utime = Date.now() / 1000;
  if (utime < rateLimitReset) {
    return Promise.reject(errors.ipRateLimited);
  }

  return new Promise((resolve, reject) => {
    api(
      {
        url: req.url,
        method: req.method,
        body: req.body,
        headers: {
          'content-type': 'application/json',
        },
        timeout: req.timeout,
      },
      (error: any, resp: request_lib.RequestResponse, body: any): void => {
        if (error) {
          reject(error);
          return;
        }

        if (!resp.statusCode) {
          error = new Error(
            `airbrake: request: response statusCode is ${resp.statusCode}`
          );
          reject(error);
          return;
        }

        if (resp.statusCode === 401) {
          reject(errors.unauthorized);
          return;
        }

        if (resp.statusCode === 429) {
          reject(errors.ipRateLimited);

          let h = resp.headers['x-ratelimit-delay'];
          if (!h) {
            return;
          }

          let s: string;
          if (typeof h === 'string') {
            s = h;
          } else if (h instanceof Array) {
            s = h[0];
          } else {
            return;
          }

          let n = parseInt(s, 10);
          if (n > 0) {
            rateLimitReset = Date.now() / 1000 + n;
          }

          return;
        }

        if (resp.statusCode === 204) {
          resolve({ json: null });
          return;
        }

        if (resp.statusCode >= 200 && resp.statusCode < 300) {
          let json;
          try {
            json = JSON.parse(body);
          } catch (err) {
            reject(err);
            return;
          }
          resolve(json);
          return;
        }

        if (resp.statusCode >= 400 && resp.statusCode < 500) {
          let json;
          try {
            json = JSON.parse(body);
          } catch (err) {
            reject(err);
            return;
          }
          error = new Error(json.message);
          reject(error);
          return;
        }

        body = body.trim();
        error = new Error(
          `airbrake: node: unexpected response: code=${resp.statusCode} body='${body}'`
        );
        reject(error);
      }
    );
  });
}
