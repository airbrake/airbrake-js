declare module 'airbrake-js' {
  class Client {
    constructor(opts?: any);
    public addFilter(filter: Filter): void;
    public notify(err: any): Promise<Notice>;
    public wrap(fn: any): FuncWrapper;
    public call(fn: any, ...args: any[]): any;
    public onerror(): void;
    public notifyRequest(req: IRequestInfo): void;
  }

  interface IFuncWrapper {
    (): any;
    inner: () => any;
  }

  type Filter = (notice: Notice) => Notice | null;

  interface INotice {
    id: string;
    errors: AirbrakeError[];
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

  type time = Date | number | [number, number];

  interface IRequestInfo {
    method: string;
    route: string;
    statusCode: number;
    start: time;
    end: time;
  }

  export = Client;
}
