export type Resolver = (value: any) => void;
export type Rejector = (reason: Error) => void;

export default class Promise {
    private onResolved: Resolver[] = [];
    private onRejected: Rejector[] = [];

    private resolvedWith;
    private rejectedWith: Error;

    constructor(executor?) {
        if (executor) {
            executor(this.resolve.bind(this), this.reject.bind(this));
        }
    }

    then(onResolved: Resolver, onRejected?: Rejector): Promise {
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

    catch(onRejected: Rejector): Promise {
        if (this.rejectedWith) {
            onRejected(this.rejectedWith);
        } else {
            this.onRejected.push(onRejected);
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
        return this;
    }
}
