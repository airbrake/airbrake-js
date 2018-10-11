import Options from '../options';
import {request as fetchRequest} from './fetch';
import {makeRequester as makeNodeRequester} from './node';

export interface HttpRequest {
    method: string;
    url: string;
    body: string;
    timeout?: number;
}

export interface HttpResponse {
    json: any;
}

export type Requester = (req: HttpRequest) => Promise<HttpResponse>;

export function makeRequester(opts: Options): Requester {
    if (opts.request) {
        return makeNodeRequester(opts.request);
    }
    return fetchRequest;
}

export let errors = {
    unauthorized: new Error('airbrake: unauthorized: project id or key are wrong'),
    ipRateLimited: new Error('airbrake: IP is rate limited'),
};
