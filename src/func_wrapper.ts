interface FuncWrapper {
    (): any;
    inner: () => any;
    _airbrake?: boolean;
}

export default FuncWrapper;
