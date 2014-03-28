expect = require("chai").expect
sinon = require("sinon")

jsonify = require("../../../src/util/jsonify_notice.coffee")

describe "jsonify_notice", ->
  notice = {
    params: {param1: 'value1'},
    environment: {env1: 'value1'},
    session: {session1: 'value1'},
  }

  it "preserves params, environment and session", ->
    json = jsonify(notice)
    expect(json).to.equal('{"params":{"param1":"value1"},"environment":{"env1":"value1"},"session":{"session1":"value1"}}')
