define ['client', 'instrumentation/jquery'], (Client, instrumentJq) ->
  describe 'requirejs', ->
    it 'works', ->
      expect(Client).to.be.defined
      expect(instrumentJq).to.be.defined

  beforeEach ->
    instrumentJq(new Client())

  describe 'jQuery onload instrumentation', ->
    xhr = null
    requests = null

    beforeEach ->
      xhr = sinon.useFakeXMLHttpRequest()

      requests = []
      xhr.onCreate = (req) ->
        requests.push(req)

      jQuery ->
        throw new Error('onload test exception')

    afterEach ->
      #xhr.restore() # TODO: fix

    it 'catches exception', ->
      expect(requests.length).to.equal(1)
      req = requests[0]
      expect(req.method).to.equal('POST')
      expect(req.url).to.equal('https://api.airbrake.io/api/v3/projects/0/notices?key=')
      body = JSON.parse(req.requestBody)
      expect(body.errors[0].message).to.equal('Error: onload test exception')

  describe 'jQuery promise instrumentation', ->
    xhr = null
    requests = []

    beforeEach ->
      xhr = sinon.useFakeXMLHttpRequest()
      requests = []
      xhr.onCreate = (req) ->
        requests.push(req)

      deferred = jQuery.Deferred()
      deferred.always ->
        throw new Error('promise test exception')
      deferred.resolve()

    afterEach ->
  #    xhr.restore() # TODO: fix

    it 'catches exception', ->
      expect(requests.length).to.equal(1)
      req = requests[0]
      expect(req.method).to.equal('POST')
      expect(req.url).to.equal('https://api.airbrake.io/api/v3/projects/0/notices?key=')
      body = JSON.parse(req.requestBody)
      expect(body.errors[0].message).to.equal('Error: promise test exception')

  describe "jQuery handlers instrumentation", ->
    xhr = null
    requests = []

    beforeEach ->
      xhr = sinon.useFakeXMLHttpRequest()
      requests = []
      xhr.onCreate = (req) ->
        requests.push(req)

      fixture.base = 'test/e2e/fixtures'
      fixture.load('jquery_btn_click.html')

      $(fixture.el).find('#btn').click()

    afterEach ->
  #    xhr.restore() # TODO: fix
      fixture.cleanup()

    it 'catches exception', ->
      expect(requests.length).to.equal(1)
      req = requests[0]
      expect(req.method).to.equal('POST')
      expect(req.url).to.equal('https://api.airbrake.io/api/v3/projects/0/notices?key=')
      body = JSON.parse(req.requestBody)
      expect(body.errors[0].message).to.equal('Error: button test exception')


  describe "jQuery handlers instrumentation 2", ->
    xhr = null
    requests = []
    btn = null

    beforeEach ->
      xhr = sinon.useFakeXMLHttpRequest()
      requests = []
      xhr.onCreate = (req) ->
        requests.push(req)

      btn = $('<button></button>')
      btn.click
        handler: ->
          throw new Error('click test exception')

      btn.click()

    afterEach ->
  #    xhr.restore() # TODO: fix

    it 'catches exception', ->
      expect(requests.length).to.equal(1)
      req = requests[0]
      expect(req.method).to.equal('POST')
      expect(req.url).to.equal('https://api.airbrake.io/api/v3/projects/0/notices?key=')
      body = JSON.parse(req.requestBody)
      expect(body.errors[0].message).to.equal('Error: click test exception')
