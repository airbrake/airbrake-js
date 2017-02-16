import Client = require('../client');


function instrumentJQuery(client: Client, jq = (<any>window).jQuery): any {
    function wrapArgs(args: any[]): any[] {
        for (let i in args) {
            let arg = args[i];
            let type = typeof arg;
            if (type === 'function') {
                args[i] = client.wrap(arg);
            } else if (Array.isArray(arg)) {
                // Wrap recursively.
                args[i] = wrapArgs(arg);
            }
            return args;
        }
    }

    // Reports exceptions thrown in jQuery event handlers.
    let jqEventAdd = jq.event.add;
    jq.event.add = function(elem, types, handler, data, selector) {
        if (handler.handler) {
            if (!handler.handler.guid) {
                handler.handler.guid = jq.guid++;
            }
            handler.handler = client.wrap(handler.handler);
        } else {
            if (!handler.guid) {
                handler.guid = jq.guid++;
            }
            handler = client.wrap(handler);
        }
        return jqEventAdd(elem, types, handler, data, selector);
    };

    // Reports exceptions thrown in jQuery callbacks.
    let jqCallbacks = jq.Callbacks;
    jq.Callbacks = function(options) {
        let cb = jqCallbacks(options);
        let cbAdd = cb.add;
        cb.add = function() {
            let args = Array.prototype.slice.call(arguments);
            return cbAdd.apply(this, wrapArgs(args));
        };
        return cb;
    };

    // Reports exceptions thrown in jQuery ready callbacks.
    let jqReady = jq.fn.ready;
    jq.fn.ready = function(fn) {
        return jqReady(client.wrap(fn));
    };

    return jq;
}

export = instrumentJQuery;
