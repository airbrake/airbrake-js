import * as request from 'request';

import { IHistorianOptions } from './historian';
import Notice from './notice';
import Processor from './processor/processor';
import { ITDigestConstructor } from './routes';

type Reporter = (notice: Notice) => Promise<Notice>;

interface IOptionsBase {
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

export interface IOptionsProjectProps extends IOptionsBase {
  projectId: number;
  projectKey: string;
}

export interface IOptionsApiProxyProp extends IOptionsBase {
  apiProxy: {
    notices: string;
    routesStats: string;
  };
}

type IOptions = IOptionsProjectProps | IOptionsApiProxyProp;

export default IOptions
