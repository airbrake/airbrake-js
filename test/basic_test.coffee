Airbrake = require('../src/airbrake-js')
expect = require('chai').expect

describe "Global objects", ->
  it "Global variable defined: window.Airbrake", ->
    expect(GLOBAL.Airbrake).to.exist
