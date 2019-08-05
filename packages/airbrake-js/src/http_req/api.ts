export interface IHttpRequest {
  method: string;
  url: string;
  body: string;
  timeout?: number;
}

export interface IHttpResponse {
  json: any;
}

export type Requester = (req: IHttpRequest) => Promise<IHttpResponse>;

export let errors = {
  unauthorized: new Error(
    'airbrake: unauthorized: project id or key are wrong'
  ),
  ipRateLimited: new Error('airbrake: IP is rate limited'),
};
