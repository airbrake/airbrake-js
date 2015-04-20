class Promise
  constructor: (executor) ->
    @_onResolved = []
    @_onRejected = []
    # Save this in closure.
    resolve = => @resolve.apply(this, arguments)
    reject = => @reject.apply(this, arguments)
    if executor?
      executor(resolve, reject)

  then: (onResolved, onRejected) ->
    if onResolved
      if @_resolvedWith?
        onResolved(@_resolvedWith)
      @_onResolved.push(onResolved)

    if onRejected
      if @_rejectedWith?
        onRejected(@_resolvedWith)
      @_onRejected.push(onRejected)

    return @

  catch: (onRejected) ->
    if @_rejectedWith?
      onRejected(@_rejectedWith)
    @_onRejected.push(onRejected)
    return @

  resolve: ->
    @_resolvedWith = arguments
    for fn in @_onResolved
      fn.apply(this, @_resolvedWith)
    return @

  reject: ->
    @_rejectedWith = arguments
    for fn in @_onRejected
      fn.apply(this, @_rejectedWith)
    return @


module.exports = Promise
