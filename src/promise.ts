export type OnResolved = (value: any) => void;
export type OnRejected = (reason: Error) => void;
export type OnFinally = () => void;

export class Promise {
    private onResolved: OnResolved[] = [];
    private onRejected: OnRejected[] = [];
    private onFinally: OnFinally[] = [];

    private resolvedWith: any;
    private rejectedWith: Error;

    constructor(executor?) {
        if (executor) {
            executor(this.resolve.bind(this), this.reject.bind(this));
        }
    }

    static all(promises: Promise[]): Promise {
        let promise = new Promise();

        let values: any[] = [];
        let onResolved = (value: any) => {
            values.push(value);
            if (values.length === promises.length) {
                promise.resolve(values);
            }
        };

        let promiseRejected = false;
        let onRejected = (reason: Error) => {
            if (promiseRejected) {
                return;
            }
            promiseRejected = true;
            promise.reject(reason);
        };

        for (let p of promises) {
            p.then(onResolved, onRejected);
        }

        return promise;
    }

    then(onResolved: OnResolved, onRejected?: OnRejected): Promise {
        if (onResolved) {
            if (this.resolvedWith) {
                onResolved(this.resolvedWith);
            } else {
                this.onResolved.push(onResolved);
            }
        }

        if (onRejected) {
            if (this.rejectedWith) {
                onRejected(this.rejectedWith);
            } else {
                this.onRejected.push(onRejected);
            }
        }

        return this;
    }

    catch(onRejected: OnRejected): Promise {
        if (this.rejectedWith) {
            onRejected(this.rejectedWith);
        } else {
            this.onRejected.push(onRejected);
        }
        return this;
    }

    finally(onFinally: OnFinally): Promise {
        if (this.resolvedWith || this.rejectedWith) {
            onFinally();
        } else {
            this.onFinally.push(onFinally);
        }
        return this;
    }

    resolve(value: any): Promise {
        if (this.resolvedWith || this.rejectedWith) {
            throw new Error('Promise is already resolved or rejected');
        }
        this.resolvedWith = value;
        for (let fn of this.onResolved) {
            fn(value);
        }
        this.callOnFinally();
        return this;
    }

    reject(reason: Error): Promise {
        if (this.resolvedWith || this.rejectedWith) {
            throw new Error('Promise is already resolved or rejected');
        }
        this.rejectedWith = reason;
        for (let fn of this.onRejected) {
            fn(reason);
        }
        this.callOnFinally();
        return this;
    }

    private callOnFinally() {
        for (let fn of this.onFinally) {
            fn();
        }
    }
}

export default Promise;
