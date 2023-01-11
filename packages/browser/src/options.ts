import * as request from 'request';

import { INotice } from './notice';
import { Processor } from './processor/processor';

type Reporter = (notice: INotice) => Promise<INotice>;

export interface IInstrumentationOptions {
  onerror?: boolean;
  fetch?: boolean;
  history?: boolean;
  console?: boolean;
  xhr?: boolean;
  unhandledrejection?: boolean;
}

export interface IOptions {
  projectId: number;
  projectKey: string;
  environment?: string;
  host?: string;
  apmHost?: string;
  remoteConfigHost?: string;
  remoteConfig?: boolean;
  timeout?: number;
  keysBlocklist?: any[];
  processor?: Processor;
  reporter?: Reporter;
  instrumentation?: IInstrumentationOptions;
  errorNotifications?: boolean;
  performanceStats?: boolean;
  queryStats?: boolean;
  queueStats?: boolean;

  request?: request.RequestAPI<
    request.Request,
    request.CoreOptions,
    request.RequiredUriUrl
  >;
}
