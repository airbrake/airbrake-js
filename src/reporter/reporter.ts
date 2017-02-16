import Promise from '../promise';
import Notice from '../notice';


export interface ReporterOptions {
    projectId: number;
    projectKey: string;
    host: string;
    timeout: number;
}

export type Reporter = (notice: Notice, opts: ReporterOptions, promise: Promise) => void;

export function detectReporter(opts): string {
    if (typeof XMLHttpRequest !== 'undefined') {
        if (opts.host) {
            return 'xhr';
        }
        return 'compat';
    }

    if (typeof window !== 'undefined') {
        return 'jsonp';
    }
    return 'node';
}
