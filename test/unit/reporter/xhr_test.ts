import Promise from '../../../src/promise';
import Notice from '../../../src/notice';
import reporter from '../../../src/reporter/xhr';
import * as sinon from 'sinon';
import { expect } from '../sinon_chai';


describe('xhr reporter', () => {
    let spy;
    let notice = {} as Notice;

    beforeEach(() => {
        spy = sinon.spy(XMLHttpRequest.prototype, 'open');
    });

    afterEach(() => {
        spy.restore();
    });

    it('opens async POST to default url', () => {
        reporter(notice, {
            projectId: 123,
            projectKey: '[project_key]',
            host: 'https://api.airbrake.io',
            timeout: 1000,
        }, new Promise());
        expect(spy).to.have.been.calledWith(
            'POST',
            'https://api.airbrake.io/api/v3/projects/123/notices?key=[project_key]',
            true
        );
    });

    it('opens POST to custom url', () => {
        reporter(notice, {
            projectId: 123,
            projectKey: '[project_key]',
            host: 'https://custom.domain.com',
            timeout: 1000
        }, new Promise());
        expect(spy).to.have.been.calledWith(
            'POST',
            'https://custom.domain.com/api/v3/projects/123/notices?key=[project_key]',
            true
        );
    });
});
