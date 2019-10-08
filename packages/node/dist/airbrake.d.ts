export declare class Notifier {
  constructor(opt: IOptions);
  addFilter(filter: Filter): void;
  notify(err: any): Promise<INotice>;
  wrap(fn: any): IFuncWrapper;
  call(fn: any, ...args: any[]): any;
  flush(timeout?: number): Promise<boolean>;
}

interface IInstrumentationOptions {
  onerror?: boolean;
  fetch?: boolean;
  history?: boolean;
  console?: boolean;
  xhr?: boolean;
}

export interface IOptions {
  projectId: number;
  projectKey: string;
  environment?: string;
  host?: string;
  timeout?: number;
  keysBlacklist?: any[];
  processor?: Processor;
  reporter?: Reporter;
  instrumentation?: IInstrumentationOptions;

  request?: request.RequestAPI<
    request.Request,
    request.CoreOptions,
    request.RequiredUriUrl
  >;
}

interface IFuncWrapper {
  (): any;
  inner: () => any;
}

type Filter = (notice: INotice) => INotice | null;

interface INotice {
  id: string;
  errors: IAirbrakeError[];
  context: any;
  params: any;
  session: any;
  environment: any;
}

interface IAirbrakeFrame {
  function: string;
  file: string;
  line: number;
  column: number;
}

interface IAirbrakeError {
  type: string;
  message: string;
  backtrace: IAirbrakeFrame[];
}
