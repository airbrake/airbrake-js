export interface INoticeFrame {
  function: string;
  file: string;
  line: number;
  column: number;
}

export interface INoticeError {
  type: string;
  message: string;
  backtrace: INoticeFrame[];
}

export interface INotice {
  id?: string;
  error?: Error;

  errors?: INoticeError[];
  context?: any;
  params?: any;
  session?: any;
  environment?: any;
}
