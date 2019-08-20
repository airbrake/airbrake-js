import { IOptions } from '../options';
import { Requester } from './api';
import { request as fetchRequest } from './fetch';
import { makeRequester as makeNodeRequester } from './node';

export { Requester };

export function makeRequester(opts: IOptions): Requester {
  if (opts.request) {
    return makeNodeRequester(opts.request);
  }
  return fetchRequest;
}
