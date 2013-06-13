jQueryEventHandlerWrapper = require("../../src/jquery_event_handler_wrapper")

expect = require("chai").expect
sinon = require("sinon")

describe "jQueryEventHandlerWrapper", ->
  report_error_spy = null
  jqtrack = null

  # Setup
  beforeEach ->
    report_error_spy = sinon.spy()
    jqtrack = new jQueryEventHandlerWrapper(report_error_spy)

  it "has `on`", ->
    expect(jqtrack.on).to.exist

  it "has `off`", ->
    expect(jqtrack.off).to.exist


  describe "on", ->
    on_spy = null
    off_spy = null

    beforeEach ->
      on_spy = sinon.spy()
      off_spy = sinon.spy()


    describe "when jQuery is not defined", ->
      global.jQuery = undefined

      it "throws", ->
        expect(jqtrack.on).to.Throw()

    describe "when jQuery is defined", ->
      beforeEach ->
        global.jQuery = { fn: { on: on_spy, off: off_spy } }

      it "does not throw", ->
        expect(jqtrack.on).not.to.Throw()

      it "wraps handler", ->
        handler = sinon.spy()

        jqtrack.on()
        jQuery.fn.on("click", handler)

        call_args = on_spy.lastCall.args
        wrapper = call_args[1]

        # Verify we received the same args except for the handler
        expect(call_args[0]).to.equal("click")

        # Handler should be wrapped now
        expect(wrapper).not.to.equal(handler)

        # Manually invoke the wrapper in order to flush args
        # through to original handler
        wrapper("[threaded]")
        expect(handler.calledWith("[threaded]")).to.be.true

        # expect(on_spy.calledWith)
        # expect(on_spy)
  # describe "off", ->
