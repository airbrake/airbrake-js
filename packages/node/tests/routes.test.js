import { Routes } from '../src/routes';

describe('Routes', () => {
  it('works', () => {
    let routes = new Routes({
      projectId: 1,
      projectKey: 'test',
    });

    routes.notify({
      method: 'GET',
      route: '/projects/:id',
      statusCode: 200,
      contentType: 'application/json',
      start: new Date(1),
      end: new Date(1000),
    });
    clearTimeout(routes.timer);

    let m = JSON.parse(JSON.stringify(routes.m));
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
