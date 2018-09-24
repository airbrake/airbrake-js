import * as request from 'request';

import Notice from '../notice';


export interface ReporterOptions {
    projectId: number;
    projectKey: string;
    host: string;
    timeout: number;

    request?: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;
    ignoreWindowError?: boolean;
}


export type Reporter = (notice: Notice, payload: string, opts: ReporterOptions) => Promise<Notice>;
export default Reporter;


export function defaultReporter(opts: any): string {
    if (opts.request) {
        return 'request';
    }
    if (typeof fetch === 'function') {
        return 'fetch';
    }
    if (typeof XMLHttpRequest === 'function') {
        return 'xhr';
    }
    if (typeof window === 'object') {
        return 'jsonp';
    }
    return 'fetch';
}


export let errors = {
    unauthorized: new Error('airbrake: unauthorized: project id or key are wrong'),
    ipRateLimited: new Error('airbrake: IP is rate limited'),
};
