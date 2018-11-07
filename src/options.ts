import * as request from 'request';

import Notice from './notice';
import {HistorianOptions} from './historian';
import Processor from './processor/processor';
import {TDigestConstructor} from './routes';

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
    instrumentation?: HistorianOptions;

    request?: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;
    tdigest?: TDigestConstructor;
}
