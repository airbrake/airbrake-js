import Promise from '../promise';
import Notice from '../notice';


export interface ReporterOptions {
    projectId: number;
    projectKey: string;
    host: string;
    timeout: number;
}

export type Reporter = (notice: Notice, opts: ReporterOptions, promise: Promise) => void;
export default Reporter;

export function detectReporter(_opts): string {
    if (typeof fetch === 'function') {
        return 'fetch';
    }

    if (typeof XMLHttpRequest === 'function') {
        return 'xhr';
    }

    if (typeof window === 'object') {
        return 'jsonp';
    }

    return 'node';
}
