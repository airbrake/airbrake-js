import Promise from '../../../src/promise';
import Notice from '../../../src/notice';
import reporter from '../../../src/reporter/jsonp';
import * as sinon from 'sinon';
import { expect } from '../sinon_chai';


describe('JSONP reporter', () => {
    let head;
    let notice = {} as Notice;

    beforeEach(() => {
        head = {
            appendChild: sinon.spy()
        };
        document.getElementsByTagName = sinon.spy(() => {
            return [head];
        });
    });

    it('report creates script tag with custom host', () => {
        reporter(notice, {
            projectId: 123,
            projectKey: '[project_key]',
            host: 'https://custom.domain.com',
            timeout: 1000,
        }, new Promise());
        expect(head.appendChild).to.have.been.called;
    });
});
