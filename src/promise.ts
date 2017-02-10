export type Resolver = (value: any) => void;
export type Rejector = (reason: any) => void;

export default class Promise {
    private onResolved: Resolver[] = [];
    private onRejected: Rejector[] = [];

    private resolvedWith;
    private rejectedWith;

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
        for (let i in this.onResolved) {
            let fn = this.onResolved[i];
            fn(value);
        }
        return this;
    }

    reject(reason: any): Promise {
        if (this.resolvedWith || this.rejectedWith) {
            throw new Error('Promise is already resolved or rejected');
        }
        this.rejectedWith = reason;
        for (let i in this.onRejected) {
            let fn = this.onRejected[i];
            fn(reason);
        }
        return this;
    }
}
