Airbrake = require('../src/airbrake-js')
expect = require('chai').expect

describe "Global objects", ->
  it "Global variable defined: window.Airbrake", ->
    expect(GLOBAL.Airbrake).to.exist

  it "Global variable defined: window.Hoptoad", ->
    expect(GLOBAL.Hoptoad).to.exist

  it "Global Hoptoad and Airbrake references are the same", ->
    expect(GLOBAL.Airbrake).to.equal(GLOBAL.Hoptoad)
