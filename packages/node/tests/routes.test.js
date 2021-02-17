import { Notifier } from '../src/notifier';

describe('Routes', () => {
  const opt = {
    projectId: 1,
    projectKey: 'test',
    remoteConfig: false,
  };
  let notifier;
  let routes;
  let req;

  beforeEach(() => {
    notifier = new Notifier(opt);
    routes = notifier.routes;
    req = routes.start('GET', '/projects/:id');
    req.statusCode = 200;
    req.contentType = 'application/json';
    req.startTime = new Date(1);
    req.endTime = new Date(1000);
  });

  it('collects metrics to report to Airbrake', () => {
    routes.notify(req);
    clearTimeout(routes._routes._timer);
    clearTimeout(routes._breakdowns._timer);

    let m = JSON.parse(JSON.stringify(routes._routes._m));
    expect(m).toStrictEqual({
      '{"method":"GET","route":"/projects/:id","statusCode":200,"time":"1970-01-01T00:00:00.000Z"}': {
        count: 1,
        sum: 999,
        sumsq: 998001,
        tdigestCentroids: { count: [1], mean: [999] },
      },
    });
  });

  it('does not collect metrics that are filtered', () => {
    notifier.addPerformanceFilter(() => null);
    routes.notify(req);
    clearTimeout(routes._routes._timer);
    clearTimeout(routes._breakdowns._timer);

    expect(routes._routes._m).toStrictEqual({});
  });
});
