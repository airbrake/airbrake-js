expect = require("chai").expect
Obtainer = require("../../../src/util/sourcemaps_obtainer")

describe "SourcemapsObtainer", ->
  obtainer = new Obtainer()

  # Test ability to recognize the sourcemap directives
  describe ".sourceMapUrl", ->
    it "recognizes //# style source map urls", ->
      url = Obtainer.sourceMapUrl("//# sourceMappingURL=/test/examples/js/uglify/bundle.js.map")
      expect(url).to.equal("/test/examples/js/uglify/bundle.js.map")

    it "recognizes //@ style source map urls", ->
      url = Obtainer.sourceMapUrl("//@ sourceMappingURL=/test/examples/js/uglify/bundle.js.map")
      expect(url).to.equal("/test/examples/js/uglify/bundle.js.map")

  # Test the decoding of base64 encoded data
  describe ".dataUri", ->
    it "decodes Base64-encoded data uris", ->
      decoded = Obtainer.dataUri("//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC9leGFtcGxlcy9qcy91Z2xpZnkvYnVuZGxlLmpzIiwic291cmNlcyI6WyJ0ZXN0L2V4YW1wbGVzL2pzL3VnbGlmeS9tYWluLmpzIl0sIm5hbWVzIjpbIkVycm9yTWFrZXIiXSwibWFwcGluZ3MiOiJBQUVBLFFBQVNBLGNBQ1AifQ==")
      expect(decoded).to.equal("{\"version\":3,\"file\":\"test/examples/js/uglify/bundle.js\",\"sources\":[\"test/examples/js/uglify/main.js\"],\"names\":[\"ErrorMaker\"],\"mappings\":\"AAEA,QAASA,cACP\"}")
