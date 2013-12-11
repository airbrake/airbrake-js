expect = require("chai").expect
sinon = require("sinon")

Reporter = require("../../../src/reporters/jsonp_reporter")

describe "JsonpReporter", ->
  reporter = undefined
  createElement = undefined
  scriptTag = undefined
  headAppendChild = undefined
  headRemoveChild = undefined

  beforeEach ->
    Reporter.resetCb()

    headAppendChild = sinon.spy()
    headRemoveChild = sinon.spy()
    head = {
      removeChild: headRemoveChild
      appendChild: headAppendChild
    }
    scriptTag = {}
    createElement = sinon.stub().returns(scriptTag)
    global.document = {
      createElement: createElement
      getElementsByTagName: -> [ head ]
    }

    reporter = new Reporter("project_id")

  describe "report", ->
    beforeEach ->
      reporter("", { projectId: '[id]', projectKey: '[key]'  })

    describe "tag", ->
      it "generates", ->
        expect(createElement).to.have.been.calledWith("script")
        expect(headAppendChild).to.have.been.calledWith(scriptTag)

      it "sets properties", ->
        expect(scriptTag.src)
          .to.equal('https://api.airbrake.io/api/v3/projects/[id]/create-notice?key=[key]&callback=airbrake_cb_0&body=%22%22')
        expect(scriptTag.type).to.equal('text/javascript')

      it "removes itself `onload`", ->
        scriptTag.onload()
        expect(headRemoveChild).to.have.been.calledWith(scriptTag)
        expect(global).not.to.have.property('airbrake_cb_0')

      it "removes itself `onerror`", ->
        scriptTag.onerror()
        expect(headRemoveChild).to.have.been.calledWith(scriptTag)
        expect(global).not.to.have.property('airbrake_cb_0')

    describe "cb", ->
      it "populates global namespace", ->
        expect(global).to.have.property('airbrake_cb_0')

      it "removes itself", ->
        global.airbrake_cb_0()
        expect(global).not.to.have.property('airbrake_cb_0')
