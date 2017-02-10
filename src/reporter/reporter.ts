import Promise from '../promise';
import Notice from '../notice';


export interface ReporterOptions {
    projectId: number;
    projectKey: string;
    host: string;
}

export type Reporter = (notice: Notice, opts: ReporterOptions, promise: Promise) => void;

export function detectReporter(opts): string {
    let hasXhr = XMLHttpRequest;
    if (!opts.host && hasXhr) {
        return 'compat';
    }
    if (hasXhr) {
        return 'xhr';
    }
    return 'jsonp';
}
