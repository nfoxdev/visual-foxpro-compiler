*------------------------------------------
* nFox.dev - Marco Plaza, 2025
*------------------------------------------
lparameter prg2compile

 
try

  set logerrors on
  errFile = forceext(m.prg2compile,'err')
  compile (m.prg2compile)
  if file(m.errFile)
    strtofile( strconv(filetostr(m.errFile),9),m.errFile)
  endif    

catch to oerror

endtry


return .t.