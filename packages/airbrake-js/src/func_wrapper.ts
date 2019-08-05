interface IFuncWrapper {
  (): any;
  inner: () => any;
  _airbrake?: boolean;
}

export default IFuncWrapper;
