import { Routes, RouteMetric } from '../src/routes';

describe('Routes', () => {
  it('works', () => {
    let routes = new Routes({
      projectId: 1,
      projectKey: 'test',
    });

    let req = routes.start('GET', '/projects/:id');
    req.statusCode = 200;
    req.contentType = 'application/json';
    req.startTime = new Date(1);
    req.endTime = new Date(1000);

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
});
