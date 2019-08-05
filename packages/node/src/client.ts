import Options from './options';
import { BaseClient } from './base_client';

import { Routes } from './routes';

import nodeFilter from './filter/node';

export class Client extends BaseClient {
  public routes: Routes;

  constructor(opt: Options) {
    if (!opt.environment && process.env.NODE_ENV) {
      opt.environment = process.env.NODE_ENV;
    }
    super(opt);

    this.addFilter(nodeFilter);
    this.routes = new Routes(opt);
  }
}
