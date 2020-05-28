import { RouteMetric } from '../routes';

export type PerformanceFilter = (metric: RouteMetric) => RouteMetric | null;
