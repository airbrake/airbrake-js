import * as request from 'request';

import { IHistorianOptions } from './historian';
import Notice from './notice';
import Processor from './processor/processor';
import { ITDigestConstructor } from './routes';

type Reporter = (notice: Notice) => Promise<Notice>;

export default interface Options {
  projectId: number;
  projectKey: string;
  environment?: string;
  host?: string;
  timeout?: number;
  keysBlacklist?: any[];
  ignoreWindowError?: boolean;
  processor?: Processor;
  reporter?: Reporter;
  instrumentation?: IHistorianOptions;

  request?: request.RequestAPI<
    request.Request,
    request.CoreOptions,
    request.RequiredUriUrl
  >;
  TDigest?: ITDigestConstructor;
}
