# Airbrake = require("../dist/airbrake-js")
# expect = require("chai").expect
# sinon = require("sinon")

# describe "Global objects", ->
#   it "Global variable defined: window.Airbrake", ->
#     expect(GLOBAL.Airbrake).to.exist

# describe "Public interface", ->
#   it "Has public methods", ->
#     expected_public_methods = [
#       "setEnvironment"
#       "setKey"
#       "setErrorDefaults"
#       "setGuessFunctionName"
#       "setTrackJQ"
#       "captureException"
#     ]

#     for method in expected_public_methods
#       expect(GLOBAL.Airbrake[method]).to.exist
