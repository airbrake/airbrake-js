formatError = (err) ->
  s = ""
  s += "#{err.message}\n"
  for rec in err.backtrace
    if rec.function != ''
      s += " at #{rec.function}"
    if rec.file != ''
      s += " in #{rec.file}:#{rec.line}"
      if rec.column != 0
        s += ":#{rec.column}"
    s += '\n'
  return s


export default report = (notice) ->
  for err in notice.errors
    console?.log?(formatError(err))
