export interface IFuncWrapper {
  (): any;
  inner: () => any;
  _airbrake?: boolean;
}
