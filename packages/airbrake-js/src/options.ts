import * as request from 'request';

import { IHistorianOptions } from './historian';
import Notice from './notice';
import Processor from './processor/processor';

type Reporter = (notice: Notice) => Promise<Notice>;

export default interface IOptions {
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
}
